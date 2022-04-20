import enum
import os
from functools import cached_property
from typing import List, Type


def parse_list(comma_separated_list: str, default=None, item_type=str, delimeter: str = ",") -> List:
    """Parse a string representing a comma-separated list of values."""
    if comma_separated_list is None or len(comma_separated_list.strip()) == 0:
        return default
    return [item_type(item_str.strip()) for item_str in comma_separated_list.split(delimeter)]


def parse_enum_value(enum_cls: Type[enum.Enum], value, default):
    """Try to parse enum value."""
    if value is None:
        return enum_cls(default)
    if isinstance(value, enum_cls):
        return value
    if isinstance(value, str):
        return enum_cls(value.lower().strip())
    return enum_cls(value)


class RPCServerConfig:
    """RPC-Server configuration."""

    def __init__(self):
        self.host = os.environ.get("RPC_SERVER_HOST", "localhost")
        self.port = int(os.environ.get("RPC_SERVER_PORT", 50051))

    @property
    def address(self) -> str:
        return f"{self.host}:{self.port}"


class CacheConfig:
    """API Cache config."""

    def __init__(self):
        self.host = os.environ.get("REDIS_CACHE_HOST", "redis")
        self.port = int(os.environ.get("REDIS_CACHE_PORT", 6379))
        self.db = int(os.environ.get("REDIS_CACHE_DB", 0))


class DatabaseConfig:
    """Database connection configuration."""

    def __init__(self):
        self.port = int(os.environ.get("DATABASE_PORT", 5432))
        self.host = os.environ.get("DATABASE_HOST", "localhost")
        self.name = os.environ.get("DATABASE_NAME", "videodeduplicationdb")
        self.user = os.environ.get("DATABASE_USER", "postgres")
        self.env_password = os.environ.get("DATABASE_PASS", "admin")
        self.secret = os.environ.get("DATABASE_SECRET")
        self.dialect = os.environ.get("DATABASE_DIALECT", "postgres")
        self.override_uri = os.environ.get("DATABASE_URI")

    @cached_property
    def password(self):
        """Get database password"""
        if self.secret is not None:
            with open(self.secret, "r") as secret:
                return secret.read()
        return self.env_password

    @cached_property
    def credentials(self):
        """Get database credentials as appear in connection URI"""
        if self.user is None and self.password is None:
            return None
        if self.password is None or self.password == "":
            return self.user
        return f"{self.user}:{self.password}"

    @property
    def uri(self):
        """Get database connection URI."""
        if self.override_uri is not None:
            return self.override_uri
        if self.credentials is not None:
            return f"{self.dialect}://{self.credentials}@{self.host}:{self.port}/{self.name}"
        return f"{self.dialect}://{self.host}:{self.port}/{self.name}"


class QueueType(enum.Enum):
    """Task queue type."""

    CELERY = "celery"
    FAKE = "fake"

    @staticmethod
    def parse(value, default=CELERY):
        """Try to parse task queue type from the given value."""
        return parse_enum_value(QueueType, value, default)


class OnlinePolicy(enum.Enum):
    """Online status policy."""

    ONLINE = "online"
    OFFLINE = "offline"
    DETECT = "detect"

    @staticmethod
    def parse(value, default=DETECT):
        """Try to parse online policy."""
        return parse_enum_value(OnlinePolicy, value, default)


class Config:
    """Server configuration."""

    def __init__(self):
        self.database = DatabaseConfig()
        self.rpc_server = RPCServerConfig()
        self.cache = CacheConfig()
        self.host = os.environ.get("SERVER_HOST", "0.0.0.0")
        self.port = int(os.environ.get("SERVER_PORT", 5000))
        self.static_folder = os.environ.get("STATIC_FOLDER", "static")
        self.video_folder = os.environ.get("VIDEO_FOLDER", "/project/data")
        self.duplicate_distance = float(os.environ.get("DUPLICATE_DISTANCE", 0.1))
        self.related_distance = float(os.environ.get("RELATED_DISTANCE", 0.73))
        self.thumbnail_cache_folder = os.environ.get("THUMBNAIL_CACHE_FOLDER", "./thumbnails_cache")
        self.thumbnail_cache_cap = int(os.environ.get("THUMBNAIL_CACHE_CAP", 1000))
        self.task_log_directory = os.environ.get("TASK_LOG_DIRECTORY", "./task_logs")
        self.task_queue_type = QueueType.parse(os.environ.get("TASK_QUEUE_TYPE", QueueType.CELERY))
        self.file_store_directory = os.environ.get("FILE_STORE_DIRECTORY", "./app_files")
        self.max_upload_size = int(os.environ.get("MAX_UPLOAD_SIZE", 20 * 1024 * 1024))
        self.allowed_origins = self.read_allowed_origins()
        self.online_policy = OnlinePolicy.parse(os.environ.get("ONLINE_POLICY", OnlinePolicy.DETECT))
        self.security_storage_path = os.environ.get("SECURITY_STORAGE_PATH", ".")
        self.master_key_path = os.environ.get("SECURITY_MASTER_KEY_PATH")
        self.embeddings_folder = os.environ.get("EMBEDDINGS_FOLDER", "./embeddings")

    @staticmethod
    def read_allowed_origins():
        """Get allowed origins from the environment variables."""
        allowed_origins = parse_list(os.environ.get("ALLOWED_ORIGINS"), default=None)
        if allowed_origins is not None and len(allowed_origins) == 1:
            return allowed_origins[0]
        return allowed_origins
