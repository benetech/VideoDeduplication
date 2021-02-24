import logging
import os
from typing import Callable, Optional


# Default module logger
logger = logging.getLogger(__name__)


def logs_path_resolver(logs_directory) -> Callable[[str], Optional[str]]:
    """Create a task logs file path resolver."""

    logs_directory = os.path.normpath(os.path.abspath(logs_directory))

    def resolve_path(task_id: str) -> Optional[str]:
        """Get task's log-file path."""
        from task_queue.queue_log_handler import QueueLogHandler

        log_file_name = QueueLogHandler.log_file_name(task_id)
        log_file_path = os.path.normpath(os.path.join(logs_directory, log_file_name))
        if os.path.dirname(log_file_path) != logs_directory:
            logger.warning(
                f"Task '{task_id}' points to the log file outside of the logs root directory: {log_file_path}"
            )
            return None
        return log_file_path

    return resolve_path
