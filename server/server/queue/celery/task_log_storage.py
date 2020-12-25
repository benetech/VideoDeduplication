import logging
import os

from server.queue.celery.base_observer import BaseObserver
from task_queue.queue_log_handler import QueueLogHandler

logger = logging.getLogger(__name__)


class _TaskObserver(BaseObserver):
    def __init__(self, storage):
        self._storage = storage

    def on_task_deleted(self, task_id):
        self._storage.delete_log_file(task_id)


class TaskLogStorage:
    @staticmethod
    def log_file_name(task_id):
        """Get task log file name by id."""
        return QueueLogHandler.log_file_name(task_id)

    def __init__(self, directory):
        self.directory = os.path.abspath(directory)

    def get_log_file(self, task_id):
        log_file_path = os.path.abspath(os.path.join(self.directory, self.log_file_name(task_id)))
        if os.path.dirname(log_file_path) != self.directory:
            logger.warning(f"Task id '{task_id}' points to the log file outside logs directory!")
            return None
        return log_file_path

    def delete_log_file(self, task_id):
        log_file_path = self.get_log_file(task_id)
        if log_file_path is not None:
            os.remove(log_file_path)

    def make_task_observer(self) -> BaseObserver:
        return _TaskObserver(storage=self)
