"""This is a parent package containing components required for interaction with remote fingerprint repositories."""
from urllib.parse import urlparse, quote

from db.schema import Repository, RepositoryType
from winnow.config import Config
from winnow.remote.bare_database.client import BareDatabaseClient
from winnow.security import resolve_secure_storage, SecretNamespace


def make_client(repo: Repository, config: Config):
    """Create a remote repository client given."""
    if repo.repository_type == RepositoryType.BARE_DATABASE:
        secrets = resolve_secure_storage(config)
        credentials = secrets.get_secret(SecretNamespace.REPOS, repo.name)
        database_url = _make_bare_database_url(repo.network_address, credentials)
        return BareDatabaseClient(contributor_name=repo.account_id, database_url=database_url)
    else:
        raise ValueError(f"Unsupported remote repository type: {repo.repository_type}")


def _make_bare_database_url(network_address, credentials):
    """Construct a database connection URI."""
    address = urlparse(network_address)
    username = credentials["username"]
    password = credentials["password"]
    return (
        f"postgresql://{quote(username, safe='')}:{quote(password, safe='')}"
        f"@{quote(address.netloc, safe='')}{quote(address.path)}"
    )
