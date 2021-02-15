from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .schema import Base


# TODO: Move to db.utils
class Database:
    """Database class provides session factory and convenience methods to access database."""

    @staticmethod
    def in_memory(**options):
        """Create in-memory database."""
        return Database("sqlite:///:memory:", **options)

    def __init__(self, uri, base=Base, **options):
        """Create a new database instance.

        Each database instance will allocate it's own resources (connections, etc.).

        Args:
            uri (String): Database connection uri.
        """
        self.engine = create_engine(uri, **options)
        self.session = sessionmaker(bind=self.engine)
        self.base = base

    def create_tables(self):
        """Creates all tables specified on our internal schema."""
        self.base.metadata.create_all(bind=self.engine)

    def drop_tables(self):
        """Drop database."""
        self.base.metadata.drop_all(bind=self.engine)

    @contextmanager
    def session_scope(self, expunge=False):
        """Provide a transactional scope."""
        session = self.session()
        try:
            yield session
            if expunge:
                session.flush()
                session.expunge_all()
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def close(self):
        """Dispose of the connection pool used by this database."""
        self.engine.dispose()
