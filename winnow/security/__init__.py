from winnow.config import Config
from winnow.security.storage import SecureStorage


class SecretNamespace:
    """Standard secret namespaces."""

    REPOS = "repos"


def resolve_secure_storage(config: Config) -> SecureStorage:
    """Create and configure secure secret storage."""
    return SecureStorage(path=config.repr.directory, master_key_path=config.security.master_key_path)
