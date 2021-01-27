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
)

# Collection of all repository database schema constructs
metadata = MetaData()

# Fingerprint table
fingerprints_table = Table(
    "fingerprints",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("sha256", String, nullable=False),
    Column("fingerprint", LargeBinary, nullable=False),
    Column("contributor", String, nullable=False)
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

    def __init__(self, url, **engine_args):
        self.engine = create_engine(url, **engine_args)

    def apply_schema(self):
        """Apply repository database schema."""
        metadata.create_all(bind=self.engine)

    def drop_schema(self):
        """Drop all elements defined by repository database schema."""
        metadata.drop_all(bind=self.engine)
