import os

from cryptography.fernet import Fernet

from security import SecureStorage


def make_secure_storage(directory) -> SecureStorage:
    """Create secure storage inside directory."""
    parent_path = os.path.join(directory, "secure_storage")
    os.makedirs(parent_path)

    secure_storage_path = os.path.join(parent_path, "storage_root")
    master_key_path = os.path.join(parent_path, "master_key")

    with open(master_key_path, "w+b") as file:
        file.write(Fernet.generate_key())

    return SecureStorage(path=secure_storage_path, master_key_path=master_key_path)
