"""A number of functions to apply logging configuration presets."""
import logging
import sys

from winnow.config.config import LoggingConfig


def configure_logging_cli(config: LoggingConfig = None):
    """Configure logging for CLI scripts."""
    config = config or LoggingConfig()

    root_handler = logging.StreamHandler(sys.stdout)
    root_handler.setFormatter(logging.Formatter(config.console_format))
    root_logger = logging.getLogger()
    root_logger.addHandler(root_handler)
    root_logger.setLevel(logging.ERROR)

    winnow_logger = logging.getLogger("winnow")
    winnow_logger.setLevel(config.console_level.value)

    # Write errors to the log file
    error_log_handler = logging.FileHandler(config.file_path)
    error_log_handler.setFormatter(logging.Formatter(config.file_format))
    error_log_handler.setLevel(config.file_level.value)
    winnow_logger.addHandler(error_log_handler)
    return winnow_logger
