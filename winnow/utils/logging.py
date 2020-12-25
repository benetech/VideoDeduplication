"""A number of functions to apply logging configuration presets."""
import logging
import sys


def configure_logging_cli(error_log_file="processing_error.log"):
    """Configure logging for CLI scripts."""
    root_logger = logging.getLogger()
    winnow_logger = logging.getLogger("winnow")
    root_logger.setLevel(logging.ERROR)
    root_logger.addHandler(logging.StreamHandler(sys.stdout))
    winnow_logger.setLevel(logging.INFO)

    # Write errors to the log file
    error_log_handler = logging.FileHandler(error_log_file)
    error_log_handler.setFormatter(logging.Formatter("[%(asctime)s: %(levelname)s] [%(name)s] %(message)s"))
    error_log_handler.setLevel(logging.ERROR)
    winnow_logger.addHandler(error_log_handler)
    return winnow_logger
