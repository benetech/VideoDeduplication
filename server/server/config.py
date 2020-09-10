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
            with open(self.secret, 'r') as secret:
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
