"""A number of functions to apply logging configuration presets."""
import inspect
import logging
import sys


def configure_logging_cli(error_log_file="processing_error.log") -> logging.Logger:
    """Configure logging for CLI scripts."""
    root_logger = logging.getLogger()
    winnow_logger = logging.getLogger("winnow")
    root_logger.setLevel(logging.ERROR)
    root_handler = logging.StreamHandler(sys.stdout)
    root_handler.setFormatter(logging.Formatter("[%(asctime)s: %(levelname)s] [%(name)s] %(message)s"))
    root_logger.addHandler(root_handler)
    winnow_logger.setLevel(logging.INFO)

    # Write errors to the log file
    error_log_handler = logging.FileHandler(error_log_file)
    error_log_handler.setFormatter(logging.Formatter("[%(asctime)s: %(levelname)s] [%(name)s] %(message)s"))
    error_log_handler.setLevel(logging.ERROR)
    winnow_logger.addHandler(error_log_handler)
    return winnow_logger


def configure_logging_server(
    name: str,
    level: int = logging.INFO,
    error_log_file: str = "processing_error.log",
    format: str = "[%(asctime)s: %(levelname)s] [%(name)s] %(message)s",
) -> logging.Logger:
    """Configure logging for CLI scripts."""
    # configure winnow logger
    root_logger = logging.getLogger()
    winnow_logger = logging.getLogger("winnow")
    root_logger.setLevel(logging.ERROR)
    root_logger.addHandler(logging.StreamHandler(sys.stdout))
    winnow_logger.setLevel(level)

    # Write errors to the log file
    error_log_handler = logging.FileHandler(error_log_file)
    error_log_handler.setFormatter(logging.Formatter(format))
    error_log_handler.setLevel(logging.ERROR)
    winnow_logger.addHandler(error_log_handler)

    # Configure requested logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    return logger


def logger_name(owner) -> str:
    """Get appropriate logger name for an owner."""
    if inspect.isclass(owner) or inspect.isfunction(owner) or inspect.ismethod(owner):
        return f"{inspect.getmodule(owner).__name__}.{owner.__qualname__}"
    return logger_name(type(owner))
