import abc
import math
import pickle
from math import ceil
from typing import Iterable, List, Union

from sqlalchemy import func
from sqlalchemy.orm import joinedload

from db import Database
from db.schema import Repository, Files, Contributor, Signature
from remote import RepositoryClient
from remote.helpers import file_to_local_fingerprint
from remote.model import RemoteFingerprint, LocalFingerprint, RemoteRepository
from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor
from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.file_key import FileKey
from winnow.storage.remote_signatures_dao import ReprRemoteSignaturesDAO
from winnow.utils.iterators import chunks


class RemoteConnector(abc.ABC):
    """Connector communicates with remote repository and stores all the acquired fingerprints to the local storage."""

    @property
    @abc.abstractmethod
    def repository(self) -> RemoteRepository:
        """Get the corresponding remote repository."""
        pass

    @abc.abstractmethod
    def push_all(self, chunk_size: int = 1000, progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Push all existing files to the remote repository."""
        pass

    @abc.abstractmethod
    def pull_all(self, chunk_size=1000, progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Pull all available fingerprints form the remote repository and save them locally."""


class DatabaseConnector:
    """DatabaseConnector provides integration between local database
    and remote repository offers coarse-grained operations to push
    and pull all available fingerprints.
    """

    def __init__(self, database: Database, repo_client: RepositoryClient):
        self.database: Database = database
        self.client: RepositoryClient = repo_client

    def _repo(self, session) -> Repository:
        """Get repository entity."""
        return session.query(Repository).filter(Repository.name == self.client.repository.name).one()

    def push_all(self, chunk_size=1000, progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Push all fingerprints from the given local database to the remote repository."""
        with self.database.session_scope() as session:
            resume_id = self._get_push_resume_id(session)
            file_query = session.query(Files).options(joinedload(Files.signature))
            file_query = file_query.filter(Files.id >= resume_id, Files.contributor == None)  # noqa: E711
            file_query = file_query.yield_per(chunk_size)
            total_count = file_query.count()
            progress.scale(total_work=total_count)
            for files in chunks(iterable=file_query, size=chunk_size):
                fingerprints = map(file_to_local_fingerprint, files)
                self.client.push(fingerprints)
                progress.increase(len(files))
            progress.complete()

    def pull_all(self, chunk_size=1000, progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Pull fingerprints from remote repository and store them in a local database."""
        latest_pulled_id = self._get_latest_pulled_fingerprint_id()
        remaining_count = self.client.count(start_from=latest_pulled_id)
        iterations = math.ceil(float(remaining_count) / chunk_size)
        progress.scale(total_work=remaining_count)
        for _ in range(iterations):
            fingerprints = self.client.pull(start_from=latest_pulled_id, limit=min(chunk_size, remaining_count))
            latest_pulled_id = max(map(lambda fingerprint: fingerprint.id, fingerprints))
            remaining_count -= len(fingerprints)
            with self.database.session_scope() as session:
                repo = self._repo(session)
                self.store_remote_fingerprints(session=session, repo=repo, fingerprints=fingerprints)
            progress.increase(len(fingerprints))
        progress.complete()

    def _get_push_resume_id(self, session):
        """Get file id from which to resume pushing."""
        latest = self.client.latest_contribution()
        if latest is None:
            return 0
        query = session.query(func.min(Files.id))
        query = query.filter(Files.sha256 == latest.sha256)
        query = query.filter(Files.contributor == None)  # noqa: E711
        resume_id = query.scalar()
        if resume_id is None:
            return 0
        return resume_id

    def _get_latest_pulled_fingerprint_id(self) -> int:
        """Get latest file from the local database that was pulled from the given repository."""
        with self.database.session_scope() as session:
            repo = self._repo(session)
            query = session.query(func.max(Files.external_id))
            query = query.filter(Files.contributor.has(Contributor.repository == repo))
            latest_pulled_id = query.scalar()
            if latest_pulled_id is None:
                return 0
            return latest_pulled_id

    @staticmethod
    def store_remote_fingerprints(session, repo: Repository, fingerprints: Iterable[RemoteFingerprint]):
        """Store remote fingerprints to the local database."""
        contributors = DatabaseConnector._get_or_create_contributors(session, repo, fingerprints)
        for fingerprint in fingerprints:
            file = Files(
                sha256=fingerprint.sha256,
                contributor=contributors[fingerprint.contributor],
                external_id=fingerprint.id,
            )
            signature = Signature(signature=fingerprint.fingerprint, file=file)
            session.add(file)
            session.add(signature)

    @staticmethod
    def _get_or_create_contributors(session, repo: Repository, fingerprints: Iterable[RemoteFingerprint]):
        """Get or create fingerprint contributors."""
        contributor_names = set(fingerprint.contributor for fingerprint in fingerprints)
        existing_contributors = (
            session.query(Contributor)
            .filter(
                Contributor.repository == repo,
                Contributor.name.in_(contributor_names),
            )
            .all()
        )
        existing_names = set(contributor.name for contributor in existing_contributors)
        remaining_names = contributor_names - existing_names
        new_contributors = [Contributor(name=name, repository=repo) for name in remaining_names]
        session.add_all(new_contributors)
        return {contributor.name: contributor for contributor in (existing_contributors + new_contributors)}


class ReprConnector:
    """ReprConnector provides integration between local repr storage
    and remote fingerprint repository when local database is disabled.
    Offers coarse-grained operations to push and pull all available
    fingerprints.
    """

    def __init__(
        self,
        remote_signature_dao: ReprRemoteSignaturesDAO,
        signature_storage: BaseReprStorage,
        repo_client: RepositoryClient,
    ):
        self._client: RepositoryClient = repo_client
        self._remote_signature_dao = remote_signature_dao
        self._signature_storage: BaseReprStorage = signature_storage

    def push_all(self, chunk_size=1000, progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Push all fingerprints from the given local database to the remote repository."""
        total_count = len(self._signature_storage)
        progress.scale(total_work=total_count)
        for chunk in chunks(self._signature_storage.list(), size=chunk_size):
            fingerprints = self.to_local_fingerprints(keys=chunk, storage=self._signature_storage)
            self._client.push(fingerprints)
            progress.increase(amount=len(chunk))
        progress.complete()

    def pull_all(self, chunk_size=1000, progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Pull fingerprints from remote repository and store them in a local database."""
        latest_pulled = 0
        total_count = self._client.count(start_from=latest_pulled)
        progress.scale(total_work=total_count)

        iterations_count = ceil(total_count / float(chunk_size))
        for _ in range(iterations_count):
            fingerprints = self._client.pull(start_from=latest_pulled, limit=chunk_size)
            self._remote_signature_dao.save_signatures(fingerprints)
            latest_pulled = max(map(lambda fingerprint: fingerprint.id, fingerprints))
            progress.increase(len(fingerprints))
        progress.complete()

    @staticmethod
    def to_local_fingerprints(keys: Iterable[FileKey], storage: BaseReprStorage) -> List[LocalFingerprint]:
        return [LocalFingerprint(sha256=key.hash, fingerprint=pickle.dumps(storage.read(key))) for key in keys]


RepoConnector = Union[DatabaseConnector, ReprConnector]
