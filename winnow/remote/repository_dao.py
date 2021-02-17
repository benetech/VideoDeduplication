"""This module offers Data-Access-Objects for known remote repositories details."""
import logging
import os
from typing import List, Optional, Dict, Union

import pandas as pd
from dataclasses import asdict

from db import Database
from db.schema import Repository
from winnow.remote.model import RemoteRepository
from winnow.security import SecureStorage, SecretNamespace

# Default module logger
logger = logging.getLogger(__name__)


class RemoteRepoDatabaseDAO:
    """Data Access Object for remote repository details stored in a local database."""

    def __init__(self, database: Database, secret_storage: SecureStorage):
        self._database = database
        self._secret_storage = secret_storage

    def add(self, repository: RemoteRepository):
        """Register a new fingerprint repository."""
        if not SecureStorage.is_valid_name(repository.name):
            raise ValueError(f"Invalid repository name: {repository.name}")

        with self._database.session_scope() as session:
            # Save database entity
            new_repository = Repository(
                name=repository.name,
                repository_type=repository.type,
                network_address=repository.address,
                account_id=repository.user,
            )
            session.add(new_repository)

            # Save credentials
            self._secret_storage.set_secret(
                SecretNamespace.REPOS,
                secret_name=repository.name,
                secret_data=repository.credentials,
            )

    def get(self, name) -> Optional[RemoteRepository]:
        """Get repository by name."""
        with self._database.session_scope() as session:
            entity = session.query(Repository).filter(Repository.name == name).one_or_none()

            if entity is None:
                return None

            return self._from_entity(entity)

    def rename(self, old_name, new_name):
        """Rename remote fingerprint repository."""
        if not SecureStorage.is_valid_name(new_name):
            raise ValueError(f"Invalid repository name: {new_name}")

        # Update repository
        with self._database.session_scope() as session:
            entity = session.query(Repository).filter(Repository.name == old_name).one_or_none()
            if entity is None:
                raise KeyError(f"Repository not found: {old_name}")
            entity.name = new_name

            try:
                # Move credentials
                credentials = self._secret_storage.get_secret(SecretNamespace.REPOS, old_name)
                self._secret_storage.remove_secret(SecretNamespace.REPOS, old_name)
                self._secret_storage.set_secret(SecretNamespace.REPOS, secret_name=new_name, secret_data=credentials)
            except KeyError:
                raise KeyError(f"Repository credentials are missing: {old_name}")

    def remove(self, repository: RemoteRepository):
        """Delete remote fingerprint repository."""
        with self._database.session_scope() as session:
            # Remove repository from database
            session.query(Repository).filter(Repository.name == repository.name).delete()

            try:
                # Remove credentials within the same transaction
                self._secret_storage.remove_secret(SecretNamespace.REPOS, secret_name=repository.name)
            except KeyError:
                logger.warning("Repository credentials are missing: %s", repository.name)

    def list(self, name=None, offset=0, limit=1000) -> List[RemoteRepository]:
        """List known fingerprint repositories."""

        # Query repos
        with self._database.session_scope() as session:
            query = session.query(Repository)
            if name is not None:
                query = query.filter(Repository.name.ilike(f"%{name}%"))
            entities = query.offset(offset).limit(limit).all()
            return [self._from_entity(repo) for repo in entities]

    def _from_entity(self, entity: Repository) -> RemoteRepository:
        """Convert repository database entity to RemoteRepository model."""
        credentials = self._secret_storage.get_secret(SecretNamespace.REPOS, secret_name=entity.name)

        return RemoteRepository(
            name=entity.name,
            address=entity.network_address,
            user=entity.account_id,
            type=entity.repository_type,
            credentials=credentials,
        )


class RemoteRepoCsvDAO:
    """Data Access Object for remote repository details stored in a csv file."""

    def __init__(self, csv_file_path, secret_storage: SecureStorage):
        self._csv_file_path = os.path.abspath(csv_file_path)
        self._secret_storage = secret_storage

        if not os.path.exists(os.path.dirname(self._csv_file_path)):
            logger.debug("Creating a parent directory for repo csv file: %s", self._csv_file_path)
            os.makedirs(os.path.dirname(self._csv_file_path))

    def add(self, repository: RemoteRepository):
        """Register a new fingerprint repository."""
        if not SecureStorage.is_valid_name(repository.name):
            raise ValueError(f"Invalid repository name: {repository.name}")

        dataframe = self._dataframe()
        dataframe = dataframe.append(asdict(repository), ignore_index=True)
        dataframe = dataframe.drop_duplicates(subset=["name"], keep="last")

        # Save credentials
        self._secret_storage.set_secret(
            SecretNamespace.REPOS,
            secret_name=repository.name,
            secret_data=repository.credentials,
        )

        dataframe.to_csv(self._csv_file_path)

    def get(self, name) -> Optional[RemoteRepository]:
        """Get repository by name."""

        dataframe = self._dataframe()
        found = dataframe[dataframe["name"] == name].to_dict("records")

        if len(found) == 0:
            return None

        return self._from_row(found[0])

    def rename(self, old_name, new_name):
        """Rename remote fingerprint repository."""
        if not SecureStorage.is_valid_name(new_name):
            raise ValueError(f"Invalid repository name: {new_name}")

        repository = self.get(old_name)
        if repository is None:
            raise KeyError(f"Repository not found: {old_name}")

        self.remove(repository)
        repository.name = new_name
        self.add(repository)

    def remove(self, repository: RemoteRepository):
        """Delete remote fingerprint repository."""

        dataframe = self._dataframe()
        dataframe = dataframe[dataframe["name"] != repository.name]
        dataframe.to_csv(self._csv_file_path)

        try:
            # Remove credentials within the same transaction
            self._secret_storage.remove_secret(SecretNamespace.REPOS, secret_name=repository.name)
        except KeyError:
            logger.warning("Repository credentials are missing: %s", repository.name)

    def list(self, name=None, offset=0, limit=1000) -> List[RemoteRepository]:
        """List known fingerprint repositories."""
        dataframe = self._dataframe()
        if name is not None:
            dataframe = dataframe[dataframe["name"].map(lambda actual_name: name in actual_name)]
        repos = [self._from_row(row) for row in dataframe.to_dict("records")]
        return repos[offset : offset + limit]

    def _from_row(self, row: Dict) -> RemoteRepository:
        """Convert repository database entity to RemoteRepository model."""
        credentials = self._secret_storage.get_secret(SecretNamespace.REPOS, secret_name=row["name"])
        repository = RemoteRepository(**row)
        repository.credentials = credentials
        return repository

    def _dataframe(self) -> pd.DataFrame:
        """Get read repository details from csv file as Pandas DataFrame."""
        if os.path.exists(self._csv_file_path):
            return pd.read_csv(self._csv_file_path)
        return pd.DataFrame((), columns=["name", "address", "user", "type"])


RepoDAO = Union[RemoteRepoDatabaseDAO, RemoteRepoCsvDAO]
