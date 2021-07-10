import abc
import logging
import os
import pickle
from datetime import datetime
from os import listdir
from os.path import isdir
from typing import Dict, Iterable, Iterator

import numpy as np
import pandas as pd
from sqlalchemy import tuple_
from sqlalchemy.orm import Session

from db import Database
from db.access.files import FilesDAO
from db.schema import Matches
from winnow.remote.model import RemoteFingerprint
from winnow.storage.base_repr_storage import ReprStorageFactory
from winnow.storage.legacy.lmdb_repr_storage import LMDBReprStorage
from winnow.storage.legacy.repr_key import ReprKey
from winnow.storage.simple_repr_storage import SimpleReprStorage
from winnow.utils.iterators import chunks

# Default module logger
logger = logging.getLogger(__name__)


class RemoteSignaturesDAO(abc.ABC):
    """Abstract data-access object that manages pulled remoted signatures in some local storage."""

    @abc.abstractmethod
    def query_signatures(
        self,
        repository_name: str = None,
        contributor_name: str = None,
        chunk_size: int = 1000,
    ) -> Iterator[Dict[int, np.array]]:
        """
        Bulk iterator over remote signatures.

        Yields dicts of the shape {remote_signature_id: remote_signature}
        where size of each dict size is limited by 'chunk_size:int'.
        """
        pass

    @abc.abstractmethod
    def count(self, repository_name: str = None, contributor_name: str = None) -> int:
        """Count remote signatures."""
        pass

    @abc.abstractmethod
    def save_matches(self, matches):
        """Save multiple matches of the form (remote_signature_id, local_file_repr_key, distance)."""
        pass


class DBRemoteSignaturesDAO(RemoteSignaturesDAO):
    """Manages pulled remote signatures stored in a database."""

    def __init__(self, database: Database):
        self.database: Database = database

    def query_signatures(self, repository_name: str = None, contributor_name: str = None, chunk_size=1000):
        """
        Bulk iterator over remote signatures.

        Yields dicts of the shape {remote_signature_id: remote_signature}
        where size of each dict size is limited by 'chunk_size:int'.
        """
        with self.database.session_scope() as session:
            remote_files = FilesDAO.query_remote_files(
                session,
                repository_name=repository_name,
                contributor_name=contributor_name,
            ).yield_per(chunk_size)
            for chunk in chunks(remote_files, size=chunk_size):
                yield {file.id: pickle.loads(file.signature.signature) for file in chunk}

    def count(self, repository_name: str = None, contributor_name: str = None) -> int:
        """Count remote signatures."""
        with self.database.session_scope() as session:
            return FilesDAO.query_remote_files(
                session,
                repository_name=repository_name,
                contributor_name=contributor_name,
            ).count()

    def save_matches(self, matches):
        """Save multiple matches of the form (remote_signature_id, local_file_repr_key, distance)."""
        with self.database.session_scope() as session:
            matches_dict = self._resolve_file_ids(session, matches)

            # Update existing matches
            existing = self._get_existing_matches(session, matches_dict.keys())
            for id_pair, match in existing:
                match.distance = matches_dict[id_pair]

            # Create missing matches
            missing = set(matches_dict.keys()) - set(existing.keys())
            for remote_id, local_id in missing:
                distance = matches_dict[(remote_id, local_id)]
                new_match = Matches(query_video_file_id=remote_id, match_video_file_id=local_id, distance=distance)
                session.add(new_match)

    def _local_files(self, session: Session, repr_keys: Iterable[ReprKey]) -> Dict[ReprKey, int]:
        """Get local files database ids."""
        key_index = {(key.path, key.hash): key for key in repr_keys}
        local_files = FilesDAO.query_local_files(session, key_index.keys())
        return {key_index[(file.file_path, file.sha256)]: file.id for file in local_files.all()}

    def _resolve_file_ids(self, session: Session, matches):
        """Replace local file repr-keys with the corresponding database ids."""
        local_files = self._local_files(session, (key for _, key, _ in matches))
        return {(remote_id, local_files[local_key]): distance for remote_id, local_key, distance in matches}

    def _get_existing_matches(self, session: Session, id_pairs) -> Dict:
        """Get existing matches for the given id pairs."""
        matched_file_ids = tuple_(Matches.query_video_file_id, Matches.match_video_file_id)
        existing_matches = session.query(Matches).filter(matched_file_ids.in_(tuple(id_pairs)))
        return {(match.query_video_file_id, match.match_video_file_id): match for match in existing_matches}


class ReprRemoteSignaturesDAO(RemoteSignaturesDAO):
    """Manages pulled remote signatures stored in a composite repr-storage."""

    def __init__(self, root_directory, output_directory, storage_factory: ReprStorageFactory = SimpleReprStorage):
        self._root_directory = os.path.abspath(root_directory)
        self._output_directory: str = os.path.abspath(output_directory)
        self._storage_factory: ReprStorageFactory = storage_factory

        if not os.path.isdir(self._root_directory):
            logger.info("Creating remote signature storage root: %s", self._root_directory)
            os.makedirs(self._root_directory)

        if not os.path.isdir(self._output_directory):
            logger.info("Creating remote matches output directory: %s", self._output_directory)
            os.makedirs(self._output_directory)

        # Cached storages
        self._storages = {}

    def query_signatures(self, repository_name: str = None, contributor_name: str = None, chunk_size=1000):
        """
        Bulk iterator over remote signatures.

        Yields dicts of the shape {remote_signature_id: remote_signature}
        where size of each dict size is limited by 'chunk_size:int'.
        """
        remote_signatures = self._iter_signatures(repository_name, contributor_name)
        for chunk in chunks(remote_signatures, size=chunk_size):
            yield {(repo, contrib, hash): signature for repo, contrib, hash, signature in chunk}

    def save_signatures(self, repository_name: str, signatures: Iterable[RemoteFingerprint]):
        """Save remote fingerprints to the local representation storage."""
        for item in signatures:
            storage = self._get_storage(repository_name, contributor=item.contributor)
            storage.write(ReprKey(path=item.sha256, hash=item.sha256), item.fingerprint)

    def count(self, repository_name: str = None, contributor_name: str = None) -> int:
        """Count remote signatures."""
        total_count = 0
        for repo in self._repos(repository_name):
            for contributor in self._contributors(repo, contributor_name):
                storage = self._get_storage(repo, contributor)
                total_count += len(storage)
        return total_count

    def save_matches(self, matches):
        """Save multiple matches of the form (remote_signature_id, local_file_repr_key, distance)."""
        timestamp = datetime.now().strftime("%Y_%m_%d_%H%M%S%f")
        report_file_name = os.path.join(self._output_directory, f"remote_matches_{timestamp}.csv")
        dataframe = pd.DataFrame(
            tuple(self._csv_entry(match) for match in matches),
            columns=[
                "remote_repository",
                "remote_contributor",
                "remote_sha256",
                "local_path",
                "local_sha256",
                "distance",
            ],
        )
        dataframe.to_csv(report_file_name)

    def _csv_entry(self, match):
        """Flatten match to a tuple."""
        (repo, contrib, hash), local_file_key, distance = match
        return repo, contrib, hash, local_file_key.path, local_file_key.hash, distance

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

    def _get_storage(self, repo, contributor) -> LMDBReprStorage:
        """Get signature repr storage for the given repo and contributor."""
        if (repo, contributor) not in self._storages:
            storage_directory = self._contributor_dir(repo, contributor)
            self._storages[(repo, contributor)] = self._storage_factory(storage_directory)
        return self._storages[(repo, contributor)]

    def _iter_signatures(self, repository_name=None, contributor_name=None):
        """Iterate over all signatures."""
        for repo in self._repos(repository_name):
            for contributor in self._contributors(repo, contributor_name):
                storage = self._get_storage(repo, contributor)
                for key in storage.list():
                    yield repo, contributor, key.hash, storage.read(key)
