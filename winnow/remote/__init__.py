"""This is a parent package containing components required for interaction with remote fingerprint repositories."""

from db.schema import RepositoryType
from winnow.remote.bare_database.client import BareDatabaseClient
from winnow.remote.model import RepositoryClient, RemoteRepository


def make_client(repo: RemoteRepository) -> RepositoryClient:
    """Create remote repository client."""
    if repo.type is RepositoryType.BARE_DATABASE:
        return BareDatabaseClient(contributor_name=repo.user, database_url=repo.credentials)
    else:
        raise ValueError(f"Unsupported repository type: {repo.type}")
