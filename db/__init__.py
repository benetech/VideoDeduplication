from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from .schema import Base


class Database:
    """Database class provides session factory and convenience methods to access database."""

    @staticmethod
    def from_uri(uri: str, base=Base, **options):
        """
        Create database from uri.

        Args:
            uri: Database connection uri.
            base: Base class for model classes
            **options: any additional `create_engine` options
        """
        engine = create_engine(uri, **options)
        make_session = sessionmaker(bind=engine)
        return Database(engine, make_session, base)

    @staticmethod
    def in_memory(**options):
        """Create in-memory database."""
        return Database.from_uri("sqlite:///:memory:", **options)

    def __init__(self, engine, make_session, base=Base):
        """Create a new database instance.

        Each database instance will allocate its own resources (connections, etc.).
        """
        self.engine = engine
        self.session = make_session
        self.base = base

    def create_tables(self):
        """Creates all tables specified on our internal schema."""
        self.base.metadata.create_all(bind=self.engine)

    def drop_tables(self):
        """Drop database."""
        self.base.metadata.drop_all(bind=self.engine)

    @contextmanager
    def session_scope(self, expunge=False) -> Session:
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
