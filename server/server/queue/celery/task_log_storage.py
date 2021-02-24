import logging
import os
from typing import Optional

from server.queue.file_streaming import FileStreamer, BaseFileStream
from server.queue.framework import BaseObserver
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

    def __init__(self, directory, file_streamer=None):
        self.directory = os.path.abspath(directory)
        self._file_streamer = file_streamer or FileStreamer()

    def get_log_file(self, task_id):
        log_file_path = os.path.abspath(os.path.join(self.directory, self.log_file_name(task_id)))
        if os.path.dirname(log_file_path) != self.directory:
            logger.warning(f"Task id '{task_id}' points to the log file outside logs directory!")
            return None
        return log_file_path

    def delete_log_file(self, task_id):
        log_file_path = self.get_log_file(task_id)
        if log_file_path is not None and os.path.isfile(log_file_path):
            os.remove(log_file_path)

    def make_task_observer(self) -> BaseObserver:
        return _TaskObserver(storage=self)

    def stream_task_logs(self, task_id, callback, offset=0, whence=os.SEEK_SET) -> Optional[BaseFileStream]:
        file_path = self.get_log_file(task_id)
        if not os.path.isfile(file_path):
            return None
        file = open(file_path)
        file.seek(offset, whence)
        return self._file_streamer.start_stream(file=file, callback=callback, finished=False)

    def broadcast_logs(self):
        """Broadcast log updates. This is a blocking method, you
        probably want to execute it in a background thread."""
        self._file_streamer.broadcast()
