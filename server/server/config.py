import os
from functools import cached_property


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


class Config:
    """Server configuration."""

    def __init__(self):
        self.database = DatabaseConfig()
        self.host = os.environ.get("SERVER_HOST", "0.0.0.0")
        self.port = int(os.environ.get("SERVER_PORT", 5000))
        self.static_folder = os.environ.get("STATIC_FOLDER", "static")
        self.video_folder = os.environ.get("VIDEO_FOLDER", "/project/data")
        self.duplicate_distance = float(os.environ.get("DUPLICATE_DISTANCE", 0.1))
        self.related_distance = float(os.environ.get("RELATED_DISTANCE", 0.73))
        self.thumbnail_cache_folder = os.environ.get("THUMBNAIL_CACHE_FOLDER", "./thumbnails_cache")
        self.thumbnail_cache_cap = int(os.environ.get("THUMBNAIL_CACHE_CAP", 1000))
        self.task_log_directory = os.environ.get("TASK_LOG_DIRECTORY", "./task_logs")
