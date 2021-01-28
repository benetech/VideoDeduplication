from repo_admin.cli.handlers.schema import SchemaCliHandler


class RootCliHandler:
    """A command-line tool for video fingerprint repository management."""

    def __init__(self):
        self.schema = SchemaCliHandler()
