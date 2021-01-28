from repo_admin.cli.handlers.schema import SchemaCliHandler
from repo_admin.cli.handlers.user import UserCliHandler


class RootCliHandler:
    """A command-line tool for video fingerprint repository management."""

    def __init__(self):
        self.schema = SchemaCliHandler()
        self.user = UserCliHandler()
