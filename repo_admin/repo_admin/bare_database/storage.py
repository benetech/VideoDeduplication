import json
import logging
import os
import stat

from dataclasses import asdict

from repo_admin.bare_database.model import Repository

# Default module logger
logger = logging.getLogger(__name__)


class RepoStorage:
    """Persistent repository storage."""

    def __init__(self, directory="~/.benetech-repo-admin"):
        self.directory = os.path.abspath(os.path.expanduser(directory))
        if not os.path.exists(self.directory):
            logger.info("Creating repository credentials directory %s", self.directory)
            os.makedirs(self.directory)
            os.chmod(self.directory, stat.S_IRWXU)

    def save(self, repo: Repository) -> Repository:
        """Save repository to the persistent storage."""
        repo.ensure_valid()

        file_path = self._file_path(repo.name)
        with open(file_path, "w") as file:
            file.write(self._serialize(repo))
        os.chmod(file_path, stat.S_IRUSR | stat.S_IWUSR)
        return repo

    def read(self, name: str) -> Repository:
        """Read repository from storage."""
        if not self.exists(name):
            raise KeyError(f"Repository not found: {name}")

        file_path = self._file_path(name)
        with open(file_path) as file:
            return self._deserialize(file.read().strip())

    def exists(self, name):
        """Check if repository exists."""
        return os.path.isfile(self._file_path(name)) and Repository.is_valid_name(name)

    def names(self):
        """List all saved repository names."""
        for name in os.listdir(self.directory):
            if self.exists(name):
                yield name

    def delete(self, *, name: str = None, repo: Repository = None):
        """Delete repository connection string."""
        name = name or repo.name
        if not self.exists(name):
            raise KeyError(f"Repository not found: {name}")
        os.remove(self._file_path(name))

    def _file_path(self, name: str) -> str:
        """Get path of the file to store repository."""
        return os.path.join(self.directory, name)

    def _serialize(self, repo: Repository) -> str:
        """Serialize repository to a string."""
        return json.dumps(asdict(repo), indent=4, sort_keys=True)

    def _deserialize(self, data: str) -> Repository:
        """Deserialize repository from a string."""
        return Repository(**json.loads(data))
