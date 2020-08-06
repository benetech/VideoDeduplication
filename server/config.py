import os


class DatabaseConfig:
    """Database connection configuration."""
    port = int(os.environ.get("DATABASE_PORT", 5432))
    host = os.environ.get("DATABASE_HOST", "localhost")
    name = os.environ.get("DATABASE_NAME", "videodeduplicationdb")
    user = os.environ.get("DATABASE_USER", "postgres")
    env_password = os.environ.get("DATABASE_PASS", "admin")
    secret = os.environ.get("DATABASE_SECRET")

    @property
    def password(self):
        """Get database password"""
        if self.secret is not None:
            with open(self.secret, 'r') as secret:
                return secret.read()
        return self.env_password


class Config:
    """Server configuration."""
    database = DatabaseConfig()
    host = os.environ.get("SERVER_HOST", "0.0.0.0")
    port = int(os.environ.get("SERVER_PORT", 5000))
    static_folder = os.environ.get("STATIC_FOLDER", "static")
