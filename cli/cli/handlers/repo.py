import sys

import inquirer

from cli.console.error import CliError
from cli.console.validate import valid_string, valid_enum, positive_int, valid_sequence
from cli.formatters import Format, resolve_formatter
from cli.security import resolve_secure_storage
from cli.transform import Transform
from db import Database
from db.schema import RepositoryType, Repository
from winnow.security import SecretNamespace
from winnow.security.storage import SecureStorage


class RepoCli:
    """Manage remote fingerprint repositories."""

    def __init__(self, config):
        self._config = config

    def add(self, name, address, user, type=RepositoryType.BARE_DATABASE.value):
        """Register new fingerprint repository."""
        name = valid_string("name", name, SecureStorage.NAME_PATTERN)
        type = valid_enum("type", type, RepositoryType)

        # Save credentials
        credentials = self._get_credentials(user, type)
        secret_storage = resolve_secure_storage(self._config)
        secret_storage.set_secret(SecretNamespace.REPOS, secret_name=name, secret_data=credentials)

        # Save repository
        database = Database(self._config.database.uri)
        with database.session_scope() as session:
            new_repository = Repository(name=name, repository_type=type, network_address=address, account_id=user)
            session.add(new_repository)

    def rename(self, old, new):
        """Rename remote fingerprint repository."""
        new = valid_string("new", new, SecureStorage.NAME_PATTERN)

        try:
            # Move credentials
            secret_storage = resolve_secure_storage(self._config)
            credentials = secret_storage.get_secret(SecretNamespace.REPOS, old)
            secret_storage.remove_secret(SecretNamespace.REPOS, old)
            secret_storage.set_secret(SecretNamespace.REPOS, secret_name=new, secret_data=credentials)
        except KeyError:
            raise CliError(f"Repository not found: {old}")

        # Update repository
        database = Database(self._config.database.uri)
        with database.session_scope() as session:
            repo = session.query(Repository).filter(Repository.name == old).one_or_none()
            if repo is None:
                raise CliError(f"Repository not found: {old}")
            repo.name = new

    def remove(self, repo):
        """Delete remote fingerprint repository."""
        try:
            # Remove credentials
            secret_storage = resolve_secure_storage(self._config)
            secret_storage.remove_secret(SecretNamespace.REPOS, secret_name=repo)
        except KeyError:
            raise CliError(f"Repository not found: {repo}")

        # Remove repository
        database = Database(self._config.database.uri)
        with database.session_scope() as session:
            session.query(Repository).filter(Repository.name == repo).delete()

    def list(self, name=None, offset=0, limit=1000, output=Format.PLAIN.value, fields=Transform.REPO_FIELDS):
        """List known fingerprint repositories."""
        output = valid_enum("output", output, Format)
        limit = positive_int("limit", limit)
        offset = positive_int("offset", offset)
        fields = valid_sequence("fields", fields, admissible_values=Transform.REPO_FIELDS)

        # Query repos
        database = Database(self._config.database.uri)
        with database.session_scope() as session:
            query = session.query(Repository)
            if name is not None:
                query = query.filter(Repository.name.ilike(f"%{name}%"))
            repos = query.offset(offset).limit(limit).all()
            items = [Transform.repo(repo) for repo in repos]
            formatter = resolve_formatter(format=output)
            formatter.format(items, fields, file=sys.stdout, highlights={"name": name})

    def _get_credentials(self, user, type=RepositoryType.BARE_DATABASE):
        if type == RepositoryType.BARE_DATABASE:
            password = inquirer.password("Please enter database password")
            return {"username": user, "password": password}
        else:
            raise CliError(f"Unsupported repo type: {type}")
