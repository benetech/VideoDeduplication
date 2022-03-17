"""A number of functions to apply logging configuration presets."""
import inspect
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


def get_logger(owner) -> logging.Logger:
    """Get logger for the given owner object."""
    return logging.getLogger(logger_name(owner))
