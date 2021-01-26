import os

from winnow.config import Config
from winnow.security.storage import SecureStorage

MASTER_KEY_VAR = "BENETECH_MASTER_KEY_PATH"


def resolve_secure_storage(config: Config) -> SecureStorage:
    master_key_path = os.environ.get(MASTER_KEY_VAR)

    # Handle empty master key path
    if not master_key_path:
        master_key_path = None

    return SecureStorage(path=config.repr.directory, master_key_path=master_key_path)
