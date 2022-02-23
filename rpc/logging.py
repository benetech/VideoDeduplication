import logging
import sys


def configure_logging(
    level: int = logging.INFO,
    error_log_file: str = "processing_error.log",
    format: str = "[%(asctime)s: %(levelname)s] [%(name)s] %(message)s",
):
    """Configure RPC server logging."""
    # configure winnow logger

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter(format))
    console_handler.setLevel(level)

    winnow_logger = logging.getLogger("winnow")
    winnow_logger.setLevel(level)
    winnow_logger.addHandler(console_handler)

    rpc_logger = logging.getLogger("rpc")
    rpc_logger.setLevel(level)
    rpc_logger.addHandler(console_handler)

    main_logger = logging.getLogger("__main__")
    main_logger.setLevel(level)
    main_logger.addHandler(console_handler)

    # Write errors to the log file
    error_log_handler = logging.FileHandler(error_log_file)
    error_log_handler.setFormatter(logging.Formatter(format))
    error_log_handler.setLevel(logging.ERROR)
