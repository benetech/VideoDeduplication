import logging
from contextlib import contextmanager
from typing import Tuple

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
    Sequence,
    sql,
)

# Default module logger
from repo_admin.bare_database.error import RepoOperationError
from repo_admin.bare_database.model import Role

logger = logging.getLogger(__name__)

# Collection of all repository database schema constructs
metadata = MetaData()

# Fingerprint table
fingerprints_table = Table(
    "fingerprints",
    metadata,
    Column("id", Integer, Sequence("fingerprints_id_seq"), primary_key=True),
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

    # Immutable parent role for all contributor roles.
    PARENT_ROLE = Role(name="benetech_repo_user_group")

    def __init__(self, url, **engine_args):
        self.engine = create_engine(url, **engine_args)
        dialect_name = self.engine.dialect.name
        if dialect_name != "postgresql":
            raise ValueError(f"Unsupported dialect: {dialect_name}. Expected: postgresql")

    def apply_schema(self):
        """Apply repository database schema."""
        metadata.create_all(bind=self.engine)
        self._create_parent_role()

    def drop_schema(self):
        """Drop all elements defined by repository database schema."""
        metadata.drop_all(bind=self.engine)
        self._drop_contributor_roles()

    def _create_parent_role(self, txn=None):
        """Create a parent role for all contributor roles."""
        with self.transaction(ongoing=txn) as txn:
            txn.execute(f"CREATE ROLE {self.PARENT_ROLE.name} NOINHERIT")
            txn.execute(f"GRANT INSERT, SELECT, UPDATE, DELETE ON fingerprints TO {self.PARENT_ROLE.name}")
            txn.execute(f"GRANT USAGE, SELECT ON SEQUENCE fingerprints_id_seq TO {self.PARENT_ROLE.name}")

    def _drop_contributor_roles(self, txn=None):
        """Drop all contributor roles."""
        roles = self.list_contributors()
        with self.transaction(ongoing=txn) as txn:
            for role in roles:
                self._delete_role(role, txn)
            self._delete_role(self.PARENT_ROLE, txn)

    def _delete_role(self, role: Role, txn=None):
        """Unconditionally delete a database role."""
        role.ensure_valid()
        with self.transaction(ongoing=txn) as txn:
            txn.execute(f"DROP USER IF EXISTS {role.name}")

    @contextmanager
    def transaction(self, ongoing=None):
        """Execute a code in a transaction."""
        if ongoing is not None:
            # Use ongoing transaction if possible
            yield ongoing
        else:
            # Otherwise create a new one
            with self.engine.connect() as connection:
                with connection.begin():
                    yield connection

    def _exists(self, role: Role, txn):
        """Check role exists."""
        statement = sql.text("SELECT COUNT(1) FROM pg_roles WHERE rolname = :name")
        return txn.execute(statement, name=role.name).scalar() == 1

    def _generate_unique_role(self, txn):
        """Generate a unique contributor name."""
        for _ in range(42):
            generated_role = Role.generate()
            if not self._exists(generated_role, txn):
                return generated_role
        raise RuntimeError("Cannot generate a unique role name.")

    def create_contributor(self, role: Role = None, txn=None) -> Role:
        """Create a database user for repository contributor."""
        with self.transaction(ongoing=txn) as txn:
            if role is None:
                role = self._generate_unique_role(txn)
            else:
                # Make sure password is specified
                role = Role.fill(role)
            role.ensure_valid()
            txn.execute(sql.text(f"CREATE USER {role.name} WITH PASSWORD :password"), password=role.password)
            txn.execute(f"GRANT {self.PARENT_ROLE.name} TO {role.name}")
            return role

    def is_contributor(self, role: Role, txn=None) -> bool:
        """Check if the given role is existing contributor role."""
        with self.transaction(ongoing=txn) as txn:
            is_contributor = txn.execute(
                sql.text(
                    "SELECT COUNT(1) "
                    "FROM pg_roles parent "
                    "JOIN pg_auth_members member ON (member.roleid = parent.oid) "
                    "JOIN pg_roles contrib ON (member.member = contrib.oid) "
                    "WHERE (parent.rolname = :parent_role)"
                    "AND (contrib.rolname = :contributor_name)"
                ),
                parent_role=self.PARENT_ROLE.name,
                contributor_name=role.name,
            ).scalar()
            return bool(is_contributor)

    def _ensure_contributor(self, role: Role, txn=None):
        """Ensure the given database user is a repository contributor."""
        if not self.is_contributor(role, txn):
            raise RepoOperationError(f"'{role.name}' is not a repository contributor")

    def delete_contributor(self, role: Role, txn=None) -> Role:
        """Delete a repo contributor database user."""
        with self.transaction(ongoing=txn) as txn:
            self._ensure_contributor(role, txn)
            self._delete_role(role, txn)
            return role

    def update_contributor(self, role: Role, txn=None) -> Role:
        """Update a repo contributor role password. Return the argument."""
        role.ensure_valid()
        with self.transaction(ongoing=txn) as txn:
            self._ensure_contributor(role, txn)
            new_password = role.password or Role.generate().password
            txn.execute(sql.text(f"ALTER USER {role.name} WITH PASSWORD :password"), password=new_password)
            return Role(name=role.name, password=new_password)

    def list_contributors(self, txn=None) -> Tuple[Role]:
        """List a repo contributors."""
        with self.transaction(ongoing=txn) as txn:
            results = txn.execute(
                sql.text(
                    "SELECT contrib.rolname "
                    "FROM pg_roles parent "
                    "JOIN pg_auth_members member ON (member.roleid = parent.oid) "
                    "JOIN pg_roles contrib ON (member.member = contrib.oid) "
                    "WHERE parent.rolname = :parent"
                ),
                parent=self.PARENT_ROLE.name,
            )
            return tuple(Role(name=entry[0]) for entry in results)
