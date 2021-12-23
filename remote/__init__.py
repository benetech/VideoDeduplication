"""This is a parent package containing components required for interaction with remote fingerprint repositories."""

from db.schema import RepositoryType
from remote.bare_database.client import BareDatabaseClient
from remote.bare_database.schema import RepoDatabase
from remote.model import RepositoryClient, RemoteRepository


def make_client(repo: RemoteRepository) -> RepositoryClient:
    """Create remote repository client."""
    if repo.type is RepositoryType.BARE_DATABASE:
        return BareDatabaseClient(repository=repo, repo_database=RepoDatabase(repo.credentials))
    else:
        raise ValueError(f"Unsupported repository type: {repo.type}")
