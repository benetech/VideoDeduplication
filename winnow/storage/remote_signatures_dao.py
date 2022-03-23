import abc
import logging
import os
import pickle
from datetime import datetime
from os import listdir
from os.path import isdir
from typing import Dict, Iterable, Iterator, Tuple, Optional, Collection

import pandas as pd
from dataclasses import dataclass
from sqlalchemy import tuple_, func
from sqlalchemy.orm import Session

from db import Database
from db.access.files import FilesDAO
from db.schema import Matches, Repository, Contributor, Files, Signature, TaskLogRecord
from remote.model import RemoteFingerprint
from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor
from winnow.storage.base_repr_storage import ReprStorageFactory, BaseReprStorage
from winnow.storage.file_key import FileKey
from winnow.storage.metadata import DataLoader
from winnow.storage.simple_repr_storage import SimpleReprStorage

# Default module logger
from winnow.utils.files import is_parent, PathTime
from winnow.utils.iterators import chunks

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RemoteMatch:
    """Remote signature match."""

    remote: RemoteFingerprint
    local: FileKey
    distance: float


class RemoteSignaturesDAO(abc.ABC):
    """Abstract data-access object that manages pulled remoted signatures in some local storage."""

    @abc.abstractmethod
    def query_signatures(
        self,
        repository_name: Optional[str] = None,
        contributor_name: Optional[str] = None,
    ) -> Iterator[RemoteFingerprint]:
        """Iterate over remote signatures."""

    @abc.abstractmethod
    def save_signatures(self, signatures: Iterable[RemoteFingerprint]):
        """Save remote fingerprints to the local storage."""

    @abc.abstractmethod
    def get_signature(self, repository_name: str, contributor_name: str, sha256: str) -> Optional[RemoteFingerprint]:
        """Get single remote fingerprint."""

    @abc.abstractmethod
    def count(self, repository_name: Optional[str] = None, contributor_name: Optional[str] = None) -> int:
        """Count remote signatures."""

    @abc.abstractmethod
    def last_remote_id(self, repository_name: Optional[str]) -> int:
        """Get the latest downloaded remote id."""


@dataclass
class RemoteMatchesReport:
    """Collection of found remote matches."""

    haystack_prefix: str
    repository_name: str
    timestamp: datetime
    max_remote_id: int
    matches: Optional[Collection[RemoteMatch]] = None


class RemoteMatchesDAO(abc.ABC):
    """Remote matches storage API."""

    @abc.abstractmethod
    def save_matches(self, report: RemoteMatchesReport, progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Save multiple DetectedMatches where needle is a remote signature key, haystack is a local file key."""
        pass

    @abc.abstractmethod
    def latest_results(self, haystack_prefix: str, repository_name: str) -> Optional[RemoteMatchesReport]:
        """Get the remote matches report."""


class DBRemoteSignaturesDAO(RemoteSignaturesDAO):
    """Manages pulled remote signatures stored in a database."""

    def __init__(self, database: Database, chunk_size: int = 10000):
        self._database: Database = database
        self._chunk_size: int = chunk_size

    def query_signatures(
        self,
        repository_name: str = None,
        contributor_name: str = None,
    ) -> Iterator[RemoteFingerprint]:
        """Iterate over remote signatures."""
        with self._database.session_scope() as session:
            remote_files = FilesDAO.query_remote_files(
                session,
                repository_name=repository_name,
                contributor_name=contributor_name,
            ).yield_per(10000)
            for remote_file in remote_files:
                yield self._remote_fingerprint(remote_file)

    def save_signatures(self, signatures: Iterable[RemoteFingerprint]):
        """Save remote fingerprints to the local storage."""
        with self._database.session_scope() as session:
            # Load or create the corresponding repositories and contributors
            repositories = self._get_repos(session, repo_names=(sig.repository for sig in signatures))
            contributors = self._get_contributors(
                session=session,
                repos=repositories,
                repo_contrib_pairs=((sig.repository, sig.contributor) for sig in signatures),
            )

            # Save remote signatures
            file_entities, sig_entities = [], []
            for remote_sig in signatures:
                file = Files(sha256=remote_sig.sha256, external_id=remote_sig.id)
                file.contributor = contributors[(remote_sig.repository, remote_sig.contributor)]
                signature = Signature(file=file, signature=pickle.dumps(remote_sig.fingerprint))
                file_entities.append(file)
                sig_entities.append(signature)
            session.add_all(file_entities)
            session.add_all(sig_entities)
            session.add_all(contributors.values())

    def get_signature(self, repository_name: str, contributor_name: str, sha256: str) -> Optional[RemoteFingerprint]:
        """Get single remote fingerprint."""
        with self._database.session_scope() as session:
            files = session.query(Files)
            files = files.filter(Files.contributor.has(Contributor.repository.has(Repository.name == repository_name)))
            files = files.filter(Files.contributor.has(Contributor.name == contributor_name))
            files = files.filter(Files.sha256 == sha256)
            file = files.one_or_none()
            if file is None:
                return None
            return self._remote_fingerprint(file)

    def count(self, repository_name: Optional[str] = None, contributor_name: Optional[str] = None) -> int:
        """Count remote signatures."""
        with self._database.session_scope() as session:
            return FilesDAO.query_remote_files(
                session,
                repository_name=repository_name,
                contributor_name=contributor_name,
            ).count()

    @staticmethod
    def _get_repos(session: Session, repo_names: Iterable[str]) -> Dict[str, Repository]:
        """Get repositories by names. Raise KeyError if repo not found."""
        repo_names = set(repo_names)
        repos = session.query(Repository).filter(Repository.name.in_(repo_names)).all()
        missing_repos = repo_names - set(repo.name for repo in repos)
        if len(missing_repos) > 0:
            raise KeyError(f"Unknown remote fingerprint repositories: {', '.join(missing_repos)}")
        return {repo.name: repo for repo in repos}

    @staticmethod
    def _get_contributors(
        session: Session,
        repos: Dict[str, Repository],
        repo_contrib_pairs: Iterable[Tuple[str, str]],
    ) -> Dict[Tuple[str, str], Contributor]:
        """Get contributors by their names, create missing contributors."""
        repo_contrib_pairs = set(repo_contrib_pairs)
        query = session.query(Contributor).join(Contributor.repository)
        query = query.filter(
            tuple_(Repository.name, Contributor.name).in_(repo_contrib_pairs),
        )
        contributors = {(contrib.repository.name, contrib.name): contrib for contrib in query.all()}
        for repo_name, contrib_name in repo_contrib_pairs - set(contributors.keys()):
            contributors[(repo_name, contrib_name)] = Contributor(name=contrib_name, repository=repos[repo_name])
        return contributors

    @staticmethod
    def _remote_fingerprint(remote_file: Files) -> RemoteFingerprint:
        """Convert remote file to RemoteFingerprint."""
        return RemoteFingerprint(
            id=remote_file.external_id,
            sha256=remote_file.sha256,
            fingerprint=pickle.loads(remote_file.signature.signature),
            repository=remote_file.contributor.repository.name,
            contributor=remote_file.contributor.name,
        )

    def last_remote_id(self, repository_name: Optional[str]) -> int:
        with self._database.session_scope() as session:
            query = session.query(func.max(Files.external_id))
            query = query.filter(Files.contributor.has(Contributor.repository.has(Repository.name == repository_name)))
            result = query.one()[0]
            if result is None:
                return 0
            return result


class DBRemoteMatchesDAO(RemoteMatchesDAO):
    """Database storage of remote matches."""

    # TaskLogRecord attributes:
    LOG_TASK_NAME = "MatchRemoteFingerprints"
    LOG_PREF_ATTR = "haystack_prefix"
    LOG_MAX_ID_ATTR = "max_remote_id"
    LOG_REPO_ATTR = "repository_name"

    def __init__(self, database: Database):
        self._database: Database = database

    def save_matches(self, report: RemoteMatchesReport, progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Save multiple DetectedMatches where needle is a remote signature key, haystack is a local file key."""
        saving = progress.bar(0.9, scale=len(report.matches), unit="matches")
        for matches in chunks(report.matches, size=10000):
            with self._database.session_scope() as session:
                local_ids = self._local_file_ids(session, file_keys=(match.local for match in matches))
                remote_ids = self._remote_file_ids(session, external_ids=(match.remote.id for match in matches))

                # Update existing matches
                id_pairs = ((remote_ids[match.remote.id], local_ids[match.local]) for match in matches)
                existing_matches = self._get_existing_matches(session, id_pairs)

                for detected_match in matches:
                    remote_id, local_id = remote_ids[detected_match.remote.id], local_ids[detected_match.local]
                    match_entity = existing_matches.get((remote_id, local_id))
                    if match_entity is None:
                        match_entity = Matches(query_video_file_id=remote_id, match_video_file_id=local_id)
                        session.add(match_entity)
                    match_entity.distance = detected_match.distance
                    saving.increase(1)
        saving.complete()
        with self._database.session_scope() as session:
            log_record = TaskLogRecord(
                task_name=self.LOG_TASK_NAME,
                timestamp=report.timestamp,
                details={
                    self.LOG_PREF_ATTR: report.haystack_prefix,
                    self.LOG_MAX_ID_ATTR: report.max_remote_id,
                    self.LOG_REPO_ATTR: report.repository_name,
                },
            )
            session.add(log_record)
        progress.complete()

    def latest_results(self, haystack_prefix: str, repository_name: str) -> Optional[RemoteMatchesReport]:
        """Get the latest results."""
        with self._database.session_scope() as session:
            task_name = TaskLogRecord.task_name == self.LOG_TASK_NAME
            repo_name = TaskLogRecord.details[self.LOG_REPO_ATTR].as_string() == repository_name
            haystack = TaskLogRecord.details[self.LOG_PREF_ATTR].as_string() == haystack_prefix
            filters = (task_name, repo_name, haystack)
            last_time = session.query(func.max(TaskLogRecord.timestamp)).filter(*filters)
            latest = TaskLogRecord.timestamp == last_time
            last_record: TaskLogRecord = session.query(TaskLogRecord).filter(latest, *filters).one_or_none()
            if last_record is None:
                return None
            return RemoteMatchesReport(
                haystack_prefix=haystack_prefix,
                repository_name=repository_name,
                max_remote_id=last_record.details[self.LOG_MAX_ID_ATTR],
                timestamp=last_record.timestamp,
                matches=None,
            )

    @staticmethod
    def _local_file_ids(session: Session, file_keys: Iterable[FileKey]) -> Dict[FileKey, int]:
        """Get local files keys -> database ids."""
        path_hash_pairs = ((key.path, key.hash) for key in file_keys)
        local_files = FilesDAO.query_local_files(session, path_hash_pairs).yield_per(10 ** 4)
        return {FileKey(file.file_path, file.sha256): file.id for file in local_files}

    @staticmethod
    def _remote_file_ids(session: Session, external_ids: Iterable[int]) -> Dict[int, int]:
        """Get remote files external_ids -> database ids."""
        remote_files = session.query(Files).filter(Files.external_id.in_(tuple(external_ids))).yield_per(10 ** 4)
        return {file.external_id: file.id for file in remote_files}

    @staticmethod
    def _get_existing_matches(session: Session, id_pairs) -> Dict[Tuple[int, int], Matches]:
        """Get existing matches for the given id pairs."""
        matched_file_ids = tuple_(Matches.query_video_file_id, Matches.match_video_file_id)
        existing_matches = session.query(Matches).filter(matched_file_ids.in_(tuple(id_pairs)))
        return {(match.query_video_file_id, match.match_video_file_id): match for match in existing_matches}


class ReprRemoteSignaturesDAO(RemoteSignaturesDAO):
    """Manages pulled remote signatures stored in a composite repr-storage."""

    @dataclass
    class RemoteFingerprintMetadata:
        """Remote fingerprint metadata."""

        external_id: int

    @staticmethod
    def _default_storage_factory(directory):
        """Default repr-storage factory."""
        return SimpleReprStorage(
            directory=directory,
            metadata_loader=DataLoader(ReprRemoteSignaturesDAO.RemoteFingerprintMetadata),
        )

    def __init__(
        self,
        root_directory,
        output_directory,
    ):
        self._root_directory: str = os.path.abspath(root_directory)
        self._output_directory: str = os.path.abspath(output_directory)
        self._storage_factory: ReprStorageFactory = self._default_storage_factory

        if not os.path.isdir(self._root_directory):
            logger.info("Creating remote signature storage root: %s", self._root_directory)
            os.makedirs(self._root_directory)

        if not os.path.isdir(self._output_directory):
            logger.info("Creating remote matches output directory: %s", self._output_directory)
            os.makedirs(self._output_directory)

        # Cached storages index: (repo, contributor) -> storage
        self._storages: Dict[Tuple[str, str], BaseReprStorage] = {}

    def query_signatures(
        self,
        repository_name: str = None,
        contributor_name: str = None,
    ) -> Iterator[RemoteFingerprint]:
        """Iterate over remote signatures."""
        for repo in self._repos(repository_name):
            for contributor in self._contributors(repo, contributor_name):
                storage = self._get_storage(repo, contributor)
                for key in storage.list():
                    fingerprint = storage.read(key)
                    external_id = self._external_id(repo, contributor, key, storage)
                    yield RemoteFingerprint(
                        id=external_id,
                        fingerprint=fingerprint,
                        sha256=key.hash,
                        repository=repo,
                        contributor=contributor,
                    )

    def save_signatures(self, signatures: Iterable[RemoteFingerprint]):
        """Save remote fingerprints to the local representation storage."""
        for item in signatures:
            storage = self._get_storage(repo=item.repository, contributor=item.contributor)
            key = FileKey(path=item.sha256, hash=item.sha256)
            metadata = self.RemoteFingerprintMetadata(external_id=item.id)
            storage.write(key, item.fingerprint, metadata=metadata)

    def get_signature(self, repository_name: str, contributor_name: str, sha256: str) -> Optional[RemoteFingerprint]:
        """Get single remote fingerprint."""
        storage = self._get_storage(repo=repository_name, contributor=contributor_name)
        signature_key = FileKey(path=sha256, hash=sha256)
        if not storage.exists(signature_key):
            return None
        return RemoteFingerprint(
            id=self._external_id(repository_name, contributor_name, signature_key, storage),
            sha256=sha256,
            fingerprint=storage.read(signature_key),
            repository=repository_name,
            contributor=contributor_name,
        )

    def count(self, repository_name: Optional[str] = None, contributor_name: Optional[str] = None) -> int:
        """Count remote signatures."""
        total_count = 0
        for repo in self._repos(repository_name):
            for contributor in self._contributors(repo, contributor_name):
                storage = self._get_storage(repo, contributor)
                total_count += len(storage)
        return total_count

    def _repos(self, name=None):
        """List repositories."""
        if name is not None and os.path.exists(self._repo_dir(name)):
            return (name,)
        if name is not None:
            return ()
        return tuple(repo for repo in listdir(self._root_directory) if isdir(self._repo_dir(repo)))

    def _contributors(self, repo, contributor=None):
        """List repository contributors."""
        if contributor is not None and os.path.exists(self._contributor_dir(repo, contributor)):
            return (contributor,)
        if contributor is not None:
            return ()
        return tuple(entry for entry in listdir(self._repo_dir(repo)) if isdir(self._contributor_dir(repo, entry)))

    def _repo_dir(self, name):
        """Get repository directory."""
        return os.path.join(self._root_directory, name)

    def _contributor_dir(self, repo, contributor):
        """Get directory with contributor signatures."""
        return os.path.join(self._repo_dir(repo), contributor)

    def _get_storage(self, repo, contributor) -> BaseReprStorage:
        """Get signature repr storage for the given repo and contributor."""
        if (repo, contributor) not in self._storages:
            storage_directory = self._contributor_dir(repo, contributor)
            self._storages[(repo, contributor)] = self._storage_factory(storage_directory)
        return self._storages[(repo, contributor)]

    @staticmethod
    def _external_id(repo: str, contributor: str, key: FileKey, storage: BaseReprStorage):
        """Get external id of the remote fingerprint."""
        metadata = storage.read_metadata(key)
        if metadata is None or metadata.external_id is None:
            return repo, contributor, key.hash  # Backward compatible way
        return metadata.external_id

    def last_remote_id(self, repository_name: Optional[str]) -> int:
        return self.count(repository_name=repository_name)


@dataclass
class _ReportDetails:
    """Persistent report details."""

    max_remote_id: int


class RemoteMatchesReportDAO(RemoteMatchesDAO):
    """Local file-system storage of remote matches."""

    _REPORT_SUFFIXES = (".csv", ".details.json")

    def __init__(self, directory: str):
        self._directory: str = directory
        self._loader = DataLoader(data_class=_ReportDetails)
        os.makedirs(self._directory, exist_ok=True)

    def save_matches(self, report: RemoteMatchesReport, progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Save multiple DetectedMatches where needle is a remote signature key, haystack is a local file key."""
        report_df = self._make_df(report, progress.subtask(0.9))
        csv_path, details_path = self._paths(report)
        os.makedirs(os.path.dirname(csv_path), exist_ok=True)
        os.makedirs(os.path.dirname(details_path), exist_ok=True)
        with open(details_path, "w") as details_file:
            report_df.to_csv(csv_path)
            self._loader.dump(_ReportDetails(max_remote_id=report.max_remote_id), details_file)
        progress.complete()

    def _paths(self, report: RemoteMatchesReport) -> Tuple[str, str]:
        """Get report paths."""
        path_prefix = self._path_prefix(report.haystack_prefix, report.repository_name)
        csv_path, details_path = PathTime.stamp_group(path_prefix, self._REPORT_SUFFIXES, time=report.timestamp)
        return csv_path, details_path

    def _path_prefix(self, haystack_prefix: str, repository_name: str) -> str:
        """Get report path prefix."""
        path_prefix = os.path.join(self._directory, repository_name, haystack_prefix, "remote_matches")
        if not is_parent(path=path_prefix, parent_path=self._directory):
            raise ValueError(f"Invalid prefix: {repository_name}/{haystack_prefix}")
        return path_prefix

    def latest_results(self, haystack_prefix: str, repository_name: str) -> Optional[RemoteMatchesReport]:
        common_prefix = self._path_prefix(haystack_prefix, repository_name)
        latest_paths, latest_time = PathTime.latest_group(common_prefix, self._REPORT_SUFFIXES)
        if latest_paths is None:
            return None
        csv_path, details_path = latest_paths
        with open(details_path, "r") as details_file:
            details: _ReportDetails = self._loader.load(details_file)
        return RemoteMatchesReport(
            haystack_prefix=haystack_prefix,
            repository_name=repository_name,
            timestamp=latest_time,
            max_remote_id=details.max_remote_id,
            matches=None,
        )

    @staticmethod
    def _make_df(report: RemoteMatchesReport, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> pd.DataFrame:
        progress.scale(len(report.matches))
        entries = []
        for match in report.matches:
            entries.append(RemoteMatchesReportDAO._csv_entry(match))
            progress.increase(1)
        report_df = pd.DataFrame(
            entries,
            columns=[
                "remote_id",
                "remote_repository",
                "remote_contributor",
                "remote_sha256",
                "local_path",
                "local_sha256",
                "distance",
            ],
        )
        progress.complete()
        return report_df

    @staticmethod
    def _csv_entry(match: RemoteMatch):
        """Flatten match to a tuple."""
        return (
            match.remote.id,
            match.remote.repository,
            match.remote.contributor,
            match.remote.sha256,
            match.local.path,
            match.local.hash,
            match.distance,
        )
