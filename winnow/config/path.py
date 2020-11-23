import os

# Environment variable holding
WINNOW_CONFIG_ENV = "WINNOW_CONFIG"

# Default config path
DEFAULT_PATH = "./config.yaml"


def resolve_config_path(path=None):
    """Resolve config-file path."""
    if path is not None:
        return os.path.abspath(path)
    if WINNOW_CONFIG_ENV in os.environ and os.path.isfile(os.environ[WINNOW_CONFIG_ENV]):
        return os.path.abspath(os.environ[WINNOW_CONFIG_ENV])
    if os.path.isfile(DEFAULT_PATH):
        return os.path.abspath(DEFAULT_PATH)
    return None
