import json
import logging
import os
import re
import stat

from cryptography.fernet import Fernet

# Module default logger
logger = logging.getLogger(__name__)


class SecureStorage:
    NAME_PATTERN = re.compile(r"^[\w][\w -]*$")
    NS_PATTERN = re.compile(r"^(?:\.|[\w][\w-]*)(?:/[\w][\w-]*)*$")

    @staticmethod
    def is_valid_name(secret_name):
        return bool(SecureStorage.NAME_PATTERN.match(secret_name))

    @staticmethod
    def is_valid_namespace(namespace):
        return bool(SecureStorage.NS_PATTERN.match(namespace))

    @staticmethod
    def _makedir(path):
        # Create secured directory if necessary
        if not os.path.exists(path):
            logger.info(f"Creating secure storage directory: {path}")
            os.makedirs(path)

            # Configure secured directory permissions
            try:
                os.chmod(path, stat.S_IRWXU)
            except PermissionError:
                logger.exception(f"Cannot set secured directory permissions: {path}")

    def __init__(self, path, master_key_path=None, encoding="utf-8"):
        self._path = os.path.join(os.path.abspath(path), ".secrets")
        self._master_key_path = master_key_path
        self._makedir(self._path)
        self._encoding = encoding

    def _get_namespace_dir(self, namespace):
        if not self.is_valid_namespace(namespace):
            raise ValueError(f"Invalid secret namespace: {namespace}")
        namespace_dir = os.path.join(self._path, namespace)
        self._makedir(namespace_dir)
        return namespace_dir

    def _get_secret_file(self, namespace, secret_name):
        if not self.is_valid_name(secret_name):
            raise ValueError(f"Invalid secret name: {secret_name}")
        namespace_dir = self._get_namespace_dir(namespace)
        return os.path.join(namespace_dir, secret_name)

    def _get_master_key(self):
        if self._master_key_path is None:
            return None
        with open(self._master_key_path) as master_key_file:
            return bytes(master_key_file.read(), "utf-8")

    def _serialize(self, secret_data):
        serialized = bytes(json.dumps(secret_data), encoding=self._encoding)
        master_key = self._get_master_key()
        if master_key is not None:
            fernet = Fernet(master_key)
            serialized = fernet.encrypt(serialized)
        return serialized

    def _deserialize(self, bytes_data):
        master_key = self._get_master_key()
        if master_key is not None:
            fernet = Fernet(master_key)
            bytes_data = fernet.decrypt(bytes_data)
        return json.loads(bytes_data)

    def set_secret(self, namespace, secret_name, secret_data):
        secret_file = self._get_secret_file(namespace, secret_name)
        serialized_secret = self._serialize(secret_data)
        with open(secret_file, "wb") as file:
            file.write(serialized_secret)

    def get_secret(self, namespace, secret_name):
        secret_file = self._get_secret_file(namespace, secret_name)
        if not os.path.isfile(secret_file):
            raise KeyError(f"Secret not found: namespace={namespace} secret_name={secret_name}")
        with open(secret_file, "rb") as file:
            serialized_secret = file.read()
            return self._deserialize(serialized_secret)

    def remove_secret(self, namespace, secret_name):
        secret_file = self._get_secret_file(namespace, secret_name)
        if not os.path.isfile(secret_file):
            raise KeyError(f"Secret not found: namespace={namespace} secret_name={secret_name}")
        os.remove(secret_file)
