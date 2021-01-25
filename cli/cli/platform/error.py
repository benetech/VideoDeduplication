from fire.core import FireError


class CliError(FireError):
    """Exception used by the CLI when command cannot be executed."""
