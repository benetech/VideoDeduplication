import logging
import os

# Environment variable holding
from shutil import copyfile

from winnow.config import Config

WINNOW_CONFIG_ENV = "WINNOW_CONFIG"

# Default config path
DEFAULT_PATH = "./config.yaml"

# Location of the default config
DEFAULT_CONFIG_LOCATION = "./default.config.yaml"

# Default logger
_log = logging.getLogger(__name__)


def resolve_config_path(path=None):
    """Resolve config-file path."""
    if path is not None:
        return os.path.abspath(path)
    if WINNOW_CONFIG_ENV in os.environ:
        return os.path.abspath(os.environ[WINNOW_CONFIG_ENV])
    if os.path.isfile(DEFAULT_PATH):
        return os.path.abspath(DEFAULT_PATH)
    return None


def ensure_config_exists(config_path, default_config_path=DEFAULT_CONFIG_LOCATION):
    """Make sure config.yaml exists at the given location."""
    # If config-file exists, then nothing to do
    if os.path.isfile(config_path):
        return

    # Prepare destination folder
    destination_folder = os.path.dirname(config_path)
    if not os.path.isdir(destination_folder):
        _log.info("Creating directory for application config: %s", destination_folder)
        os.makedirs(destination_folder)

    # Copy default config if available
    if default_config_path is not None and os.path.isfile(default_config_path):
        _log.info("Default configs are found at %s", default_config_path)
        _log.info("Copying default configs to %s", config_path)
        copyfile(default_config_path, config_path)
        return

    # Otherwise generate default configs
    _log.info("Configs are not found at %s", config_path)
    _log.info("Generating a default configs at %s", config_path)
    config = Config()
    config.save(path=config_path)
