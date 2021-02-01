import logging
import secrets
from contextlib import contextmanager

import coolname
from sqlalchemy import (
    Table,
    Column,
    Integer,
    String,
    MetaData,
    create_engine,
    LargeBinary,
    DDL,
    event,
    UniqueConstraint,
)

# Default module logger
from repo_admin.bare_database.error import RepoOperationError

logger = logging.getLogger(__name__)

# Collection of all repository database schema constructs
metadata = MetaData()

# Fingerprint table
fingerprints_table = Table(
    "fingerprints",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("sha256", String, nullable=False),
    Column("fingerprint", LargeBinary, nullable=False),
    Column("contributor", String, nullable=False),
    UniqueConstraint("contributor", "sha256", name="contributor_file_unique_constraint"),
)

# -------------------------------------
# Handle fingerprint INSERT operations.
# -------------------------------------

# Function to ensure correct contributor name upon fingerprint insertion.
_insert_fingerprint_func = DDL(
    """
    CREATE OR REPLACE FUNCTION insert_fingerprint_func() RETURNS TRIGGER AS $$
        BEGIN
            NEW.contributor = current_user;
            RETURN NEW;
        END
    $$ LANGUAGE plpgsql;
    """
)

# Trigger to ensure correct contributor name upon fingerprint insertion.
_insert_fingerprint_trigger = DDL(
    """
    CREATE TRIGGER insert_fingerprint_trigger BEFORE INSERT ON fingerprints
        FOR EACH ROW EXECUTE PROCEDURE insert_fingerprint_func();
    """
)

# -------------------------------------
# Handle fingerprint DELETE operations.
# -------------------------------------

# Function to ensure that contributors may delete only their own fingerprints
_delete_fingerprint_func = DDL(
    """
    CREATE OR REPLACE FUNCTION delete_fingerprint_func() RETURNS TRIGGER AS $$
        BEGIN
            IF (OLD.contributor = current_user) THEN
                RETURN OLD;
            ELSE
                RETURN NULL;
            END IF;
        END
    $$ LANGUAGE plpgsql;
    """
)

# Trigger to ensure that contributors may delete only their own fingerprints
_delete_fingerprint_trigger = DDL(
    """
    CREATE TRIGGER delete_fingerprint_trigger BEFORE DELETE ON fingerprints
        FOR EACH ROW EXECUTE PROCEDURE delete_fingerprint_func();
    """
)

# -------------------------------------
# Handle fingerprint UPDATE operations.
# -------------------------------------

# Function to ensure that contributors may update only their own fingerprints
_update_fingerprint_func = DDL(
    """
    CREATE OR REPLACE FUNCTION update_fingerprint_func() RETURNS TRIGGER AS $$
        BEGIN
            IF (OLD.contributor = current_user) THEN
                NEW.contributor = current_user;
                RETURN NEW;
            ELSE
                RETURN NULL;
            END IF;
        END
    $$ LANGUAGE plpgsql;
    """
)

# Function to ensure that contributors may update only their own fingerprints
_update_fingerprint_trigger = DDL(
    """
    CREATE TRIGGER update_fingerprint_trigger BEFORE UPDATE ON fingerprints
        FOR EACH ROW EXECUTE PROCEDURE update_fingerprint_func();
    """
)

# -------------------------------------
# Hook up DDL definitions.
# -------------------------------------

# Apply DDL sequences once fingerprint table is created.
# See https://docs.sqlalchemy.org/en/13/core/ddl.html#controlling-ddl-sequences
event.listen(fingerprints_table, "after_create", _insert_fingerprint_func.execute_if(dialect="postgresql"))
event.listen(fingerprints_table, "after_create", _insert_fingerprint_trigger.execute_if(dialect="postgresql"))
event.listen(fingerprints_table, "after_create", _delete_fingerprint_func.execute_if(dialect="postgresql"))
event.listen(fingerprints_table, "after_create", _delete_fingerprint_trigger.execute_if(dialect="postgresql"))
event.listen(fingerprints_table, "after_create", _update_fingerprint_func.execute_if(dialect="postgresql"))
event.listen(fingerprints_table, "after_create", _update_fingerprint_trigger.execute_if(dialect="postgresql"))


class RepoDatabase:
    """ReoDatabase offers high-level operations on the repository database."""

    USER_PARENT_ROLE = "benetech_repo_user_group"

    def __init__(self, url, **engine_args):
        self.engine = create_engine(url, **engine_args)
        dialect_name = self.engine.dialect.name
        if dialect_name != "postgresql":
            raise ValueError(f"Unsupported dialect: {dialect_name}. Expected: postgresql")

    def apply_schema(self):
        """Apply repository database schema."""
        metadata.create_all(bind=self.engine)
        self._ensure_parent_role_exists(txn=self.engine)

    def drop_schema(self):
        """Drop all elements defined by repository database schema."""
        metadata.drop_all(bind=self.engine)

    @contextmanager
    def _transaction(self):
        """Execute code in a transaction."""
        with self.engine.connect() as connection:
            with connection.begin():
                yield connection

    def _role_exists(self, role_name, txn):
        """Check role exists."""
        return txn.execute(f"SELECT COUNT(1) FROM pg_roles WHERE " f"rolname = '{role_name}'").scalar() == 1

    def _ensure_parent_role_exists(self, txn):
        """Ensure the parent role for repo users exists."""
        if not self._role_exists(self.USER_PARENT_ROLE, txn):
            logger.info("Creating parent role '%s' for repository users", self.USER_PARENT_ROLE)
            txn.execute(f"CREATE ROLE {self.USER_PARENT_ROLE} NOINHERIT")
        txn.execute(f"GRANT INSERT, SELECT, UPDATE, DELETE ON fingerprints TO {self.USER_PARENT_ROLE}")
        txn.execute(f"GRANT USAGE, SELECT ON SEQUENCE fingerprints_id_seq TO {self.USER_PARENT_ROLE}")

    def _generate_random_user_name(self, txn):
        """Generate random unique user name."""
        for _ in range(42):
            new_name = "_".join(coolname.generate(2))
            if not self._role_exists(new_name, txn):
                return new_name
        raise RuntimeError("Cannot generate a unique name.")

    def _generate_random_password(self, length=40):
        """Generate cryptographically strong random password."""
        return secrets.token_urlsafe(nbytes=length)

    def create_user(self, name=None, password=None):
        """Create a database user for repository contributor."""
        with self._transaction() as txn:
            self._ensure_parent_role_exists(txn)
            name = name or self._generate_random_user_name(txn)
            password = password or self._generate_random_password()
            txn.execute(f"CREATE USER {name} WITH PASSWORD '{password}'")
            txn.execute(f"GRANT {self.USER_PARENT_ROLE} TO {name}")
            return name, password

    def _ensure_contributor(self, user_name, txn):
        """Ensure the given database user is a repository contributor."""
        # Database user cannot be a contributor if parent role is not initialized
        if not self._role_exists(self.USER_PARENT_ROLE, txn):
            raise RepoOperationError(f"'{user_name}' is not a repository contributor")
        is_contributor_query = txn.execute(
            "SELECT COUNT(1) "
            "FROM pg_roles parent "
            "JOIN pg_auth_members member ON (member.roleid = parent.oid) "
            "JOIN pg_roles contrib ON (member.member = contrib.oid) "
            f"WHERE (parent.rolname = '{self.USER_PARENT_ROLE}')"
            f"AND (contrib.rolname = '{user_name}')"
        )
        is_contributor = is_contributor_query.scalar() == 1
        if not is_contributor:
            raise RepoOperationError(f"'{user_name}' is not a repository contributor")

    def delete_user(self, name):
        """Delete a repo contributor database user."""
        with self._transaction() as txn:
            self._ensure_contributor(name, txn)
            txn.execute(f"DROP USER {name}")

    def update_password(self, name, password=None):
        """Update a repo contributor database password."""
        with self._transaction() as txn:
            self._ensure_contributor(name, txn)
            password = password or self._generate_random_password()
            txn.execute(f"ALTER USER {name} WITH PASSWORD '{password}'")
            return name, password

    def list_users(self):
        """List a repo contributors."""
        with self._transaction() as txn:
            if not self._role_exists(self.USER_PARENT_ROLE, txn):
                return ()
            results = txn.execute(
                "SELECT contrib.rolname "
                "FROM pg_roles parent "
                "JOIN pg_auth_members member ON (member.roleid = parent.oid) "
                "JOIN pg_roles contrib ON (member.member = contrib.oid) "
                f"WHERE parent.rolname = '{self.USER_PARENT_ROLE}'"
            )
            return tuple(entry[0] for entry in results)
