import sys

from dataclasses import asdict

from cli.handlers.errors import handle_errors
from cli.platform.arguments import ask_password
from cli.platform.error import CliError
from cli.platform.formatters import Format, resolve_formatter
from cli.platform.transform import Transform
from cli.platform.validate import valid_string, valid_enum, positive_int, valid_sequence
from db.schema import RepositoryType
from winnow.pipeline.pipeline_context import PipelineContext
from remote import RemoteRepository
from security.storage import SecureStorage


class RepoCli:
    """Manage remote fingerprint repositories."""

    def __init__(self, config):
        self._pipeline = PipelineContext(config)

    @handle_errors
    def add(self, name, address, user, password=None, password_file=None, type=RepositoryType.BARE_DATABASE.value):
        """Register new fingerprint repository."""
        name = valid_string("name", name, SecureStorage.NAME_PATTERN)
        type = valid_enum("type", type, RepositoryType)

        new_repo = self._make_repo(
            name=name,
            address=address,
            user=user,
            password=password,
            password_file=password_file,
            type=type,
        )

        repository_dao = self._pipeline.repository_dao
        repository_dao.add(new_repo)

    @handle_errors
    def rename(self, old, new):
        """Rename remote fingerprint repository."""
        new = valid_string("new", new, SecureStorage.NAME_PATTERN)
        repository_dao = self._pipeline.repository_dao
        repository_dao.rename(old_name=old, new_name=new)

    @handle_errors
    def remove(self, repo):
        """Delete remote fingerprint repository."""
        repository_dao = self._pipeline.repository_dao
        repository = repository_dao.get(name=str(repo))
        if repository is None:
            raise CliError(f"Repository not found: {repo}")
        repository_dao.remove(repository)

    @handle_errors
    def list(self, name=None, offset=0, limit=1000, output=Format.PLAIN.value, fields=Transform.REPO_FIELDS):
        """List known fingerprint repositories."""
        output = valid_enum("output", output, Format)
        limit = positive_int("limit", limit)
        offset = positive_int("offset", offset)
        fields = valid_sequence("fields", fields, admissible_values=Transform.REPO_FIELDS)

        repository_dao = self._pipeline.repository_dao
        repos = list(map(asdict, repository_dao.list(name=name, offset=offset, limit=limit)))
        formatter = resolve_formatter(format=output)
        formatter.format(repos, fields, file=sys.stdout, highlights={"name": name})

    def _make_repo(self, name, address, user, password, password_file, type=RepositoryType.BARE_DATABASE):
        if type == RepositoryType.BARE_DATABASE:
            password = ask_password(
                "Please enter database password",
                literal_pass=("password", password),
                file_pass=("password_file", password_file),
                required=True,
            )
            return RemoteRepository.bare_database(name=name, address=address, user=user, password=password)
        else:
            raise CliError(f"Unsupported repo type: {type}")
