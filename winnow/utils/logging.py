"""A number of functions to apply logging configuration presets."""
import logging
import sys


def configure_logging_cli():
    """Configure logging for CLI scripts."""
    root_logger = logging.getLogger()
    winnow_logger = logging.getLogger("winnow")
    root_logger.setLevel(logging.ERROR)
    root_logger.addHandler(logging.StreamHandler(sys.stdout))
    winnow_logger.setLevel(logging.INFO)
    return winnow_logger
