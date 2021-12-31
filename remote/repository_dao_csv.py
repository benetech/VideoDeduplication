import logging
import os
from typing import Optional, List, Dict

import pandas as pd
from dataclasses import replace, asdict

from db.schema import RepositoryType
from remote import RemoteRepository
from remote.model import RepositoryStats
from remote.repository_dao import RemoteRepoDAO
from security import SecureStorage, SecretNamespace

# Default module logger
logger = logging.getLogger(__name__)


class CsvRemoteRepoDAO(RemoteRepoDAO):
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
        dataframe = dataframe.append(self._to_row(repository), ignore_index=True)
        dataframe = dataframe.drop_duplicates(subset=["name"], keep="last")

        # Save credentials
        self._secret_storage.set_secret(
            SecretNamespace.REPOS,
            secret_name=repository.name,
            secret_data=repository.credentials,
        )

        self._save(dataframe)

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
        self.add(replace(repository, name=new_name))

    def remove(self, repository: RemoteRepository):
        """Delete remote fingerprint repository."""

        dataframe = self._dataframe()
        dataframe = dataframe[dataframe["name"] != repository.name]
        self._save(dataframe)

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
        """Convert dataframe row dictionary to RemoteRepository model."""
        row["credentials"] = self._secret_storage.get_secret(SecretNamespace.REPOS, secret_name=row["name"])
        row["type"] = RepositoryType(row["type"])
        return RemoteRepository(**row)

    def _to_row(self, repo: RemoteRepository) -> Dict:
        """Convert repository to a dataframe row as dict."""
        row = asdict(repo)
        row["type"] = row["type"].value
        del row["credentials"]
        return row

    def _dataframe(self) -> pd.DataFrame:
        """Get read repository details from csv file as Pandas DataFrame."""
        if os.path.exists(self._csv_file_path):
            return pd.read_csv(self._csv_file_path)
        return pd.DataFrame((), columns=["name", "address", "user", "type"])

    def _save(self, dataframe: pd.DataFrame):
        """Save DataFrame to csv file."""
        dataframe.to_csv(self._csv_file_path, index=False)

    def update_stats(self, stats: RepositoryStats):
        """Do nothing as CSV-DAO doesn't store stats."""
