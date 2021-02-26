import os
from typing import Optional, Callable, TextIO

from server.queue.file_streamer import FileStreamer
from server.queue.framework import BaseObserver, TaskLogStorage, LogStream, TaskQueue


class _TaskObserver(BaseObserver):
    def __init__(self, storage):
        self._storage = storage

    def on_task_deleted(self, task_id):
        self._storage.delete_log_file(task_id)


class LocalFileLogStorage(TaskLogStorage):
    """Local file-system storage of task logs."""

    def __init__(self, path_resolver: Callable[[str], Optional[str]], file_streamer: FileStreamer = None):
        """Create a new file-system task log storage.

        Args:
            path_resolver: Function converting task-id into local log-file path.
            file_streamer: Log file stream manager.
        """
        self._resolve_path = path_resolver
        self._file_streamer = file_streamer or FileStreamer()

    def get_logs(self, task_id: str) -> Optional[TextIO]:
        """Get task logs as file-like object."""
        log_file_path = self._resolve_path(task_id)
        if log_file_path is None or not os.path.isfile(log_file_path):
            return None
        return open(log_file_path)

    def delete_logs(self, task_id: str):
        """Delete task logs."""
        log_file_path = self._resolve_path(task_id)
        if log_file_path is not None and os.path.isfile(log_file_path):
            os.remove(log_file_path)

    def connect(self, queue: TaskQueue):
        """Receive updates from task queue."""
        queue.observe(observer=_TaskObserver(storage=self))

    def stream_logs(self, task_id, callback, offset=0, whence=os.SEEK_SET) -> Optional[LogStream]:
        """Start a new task logs stream."""
        log_file_path = self._resolve_path(task_id)
        if log_file_path is None or not os.path.isfile(log_file_path):
            return None
        file = open(log_file_path)
        file.seek(offset, whence)
        return self._file_streamer.start_stream(file=file, callback=callback, finished=False)

    def serve_streams(self):
        """Broadcast log updates. This is a blocking method, you
        probably want to execute it in a background thread."""
        self._file_streamer.broadcast()
