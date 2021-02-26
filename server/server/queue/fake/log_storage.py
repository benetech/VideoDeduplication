import io
import logging
import os
import threading
from typing import Optional, TextIO, Set, Dict

from server.queue.framework import TaskLogStorage, LogStream, TaskQueue

# Default module logger
logger = logging.getLogger(__name__)


class FakeStream(LogStream):
    """Fake log stream."""

    def __init__(self, callback, on_stop):
        self._active = True
        self._callback = callback
        self._on_stop = on_stop

    @property
    def active(self) -> bool:
        return self._active

    def mark_finished(self):
        """Does nothing."""

    def stop(self):
        self._active = False
        if self._on_stop is not None:
            self._on_stop(self)

    def deactivate(self):
        self._active = False

    def update(self, data: str):
        """Send data to observer."""
        if self.active:
            try:
                self._callback(data)
            except:
                logger.exception("Error occurred while streaming logs data.")


class FakeLogs:
    def __init__(self):
        self._lock = threading.RLock()
        self._finished = False
        self._streams: Set[FakeStream] = set()
        self._message: str = ""

    def start_stream(self, callback, offset=0) -> FakeStream:
        """Start a new fake stream."""
        with self._lock:
            stream = FakeStream(callback, on_stop=self.stop_stream)
            stream.update(self.text(offset))
            if not self._finished:
                self._streams.add(stream)
            else:
                stream.deactivate()
            return stream

    def text(self, offset=0):
        """Get logs text as a string."""
        return self._message[offset:]

    def append(self, data: str):
        """Append text to logs."""
        with self._lock:
            if self._finished:
                return
            self._message += data
            for stream in self._streams:
                stream.update(data)

    def stop_stream(self, stream: FakeStream):
        """Stop stream."""
        with self._lock:
            if stream in self._streams:
                self._streams.remove(stream)

    def finish(self):
        """Mark logs as finished."""
        with self._lock:
            self._finished = True
            for stream in self._streams:
                stream.deactivate()
            self._streams.clear()


class FakeTaskLogStorage(TaskLogStorage):
    """Fake log storage that imitates dynamically updated task logs."""

    def __init__(self):
        self._lock = threading.RLock()
        self._logs: Dict[str, FakeLogs] = {}

    def get_logs(self, task_id: str) -> Optional[TextIO]:
        with self._lock:
            logs = self._logs.get(task_id)
            if logs is None:
                return None
            return io.StringIO(logs.text())

    def delete_logs(self, task_id: str):
        with self._lock:
            logs = self._logs.get(task_id)
            if logs is None:
                return None
            del self._logs[task_id]
            logs.finish()

    def connect(self, queue: TaskQueue):
        """Does nothing."""

    def stream_logs(self, task_id, callback, offset=0, whence=os.SEEK_SET) -> Optional[LogStream]:
        with self._lock:
            logs = self._logs.get(task_id)
            if logs is None:
                return None
            return logs.start_stream(callback, offset)

    def serve_streams(self):
        """Does nothing."""

    def create_logs(self, task_id: str) -> FakeLogs:
        with self._lock:
            logs = FakeLogs()
            self._logs[task_id] = logs
            return logs
