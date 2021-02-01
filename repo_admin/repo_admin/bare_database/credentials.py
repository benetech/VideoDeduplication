import logging

# Default module logger
import os
import re
import stat

logger = logging.getLogger(__name__)


class RepoStorage:
    """Persistent repository credentials storage."""

    # Repository name pattern
    NAME_PATTERN = re.compile(r"^[\w][\w-]*$")

    @staticmethod
    def is_valid_name(repo_name):
        """Check valid repo name."""
        return bool(RepoStorage.NAME_PATTERN.match(repo_name))

    def __init__(self, directory="~/.benetech-repo-admin"):
        self._directory = os.path.abspath(os.path.expanduser(directory))
        if not os.path.exists(self._directory):
            logger.info("Creating repository credentials directory %s", self._directory)
            os.makedirs(self._directory)
            os.chmod(self._directory, stat.S_IRWXU)

    def save_repo(self, repo_name, connection_url):
        """Save repository database connection url."""
        if not self.is_valid_name(repo_name):
            raise ValueError(f"Invalid repository name: {repo_name}")
        file_path = os.path.join(self._directory, repo_name)
        with open(file_path, "w") as file:
            file.write(connection_url)
        os.chmod(file_path, stat.S_IRUSR | stat.S_IWUSR)

    def read_repo(self, repo_name):
        """Read repo connection string."""
        if not self.exists(repo_name):
            raise KeyError(f"Repository not found: {repo_name}")
        file_path = os.path.join(self._directory, repo_name)
        with open(file_path) as file:
            return file.read().strip()

    def exists(self, repo_name):
        """Check if repository exists."""
        return self.is_valid_name(repo_name) and os.path.isfile(os.path.join(self._directory, repo_name))

    def list_repos(self):
        """List all saved repositories."""
        return (repo_name for repo_name in os.listdir(self._directory) if self.exists(repo_name))

    def delete_repo(self, repo_name):
        """Delete repository connection string."""
        if not self.exists(repo_name):
            raise KeyError(f"Repository not found: {repo_name}")
        file_path = os.path.join(self._directory, repo_name)
        os.remove(file_path)
