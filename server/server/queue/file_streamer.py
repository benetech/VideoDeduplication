import logging
import threading
import time
from abc import ABC as Abstract, abstractmethod  # noqa
from typing import TextIO, Callable, Set

from server.queue.framework import LogStream

# Default module logger
logger = logging.getLogger(__name__)


class _LogFileStream(LogStream):
    def __init__(self, file: TextIO, callback: Callable, finished: bool, chunk_size=100 * 2**10):
        self._file: TextIO = file
        self._callback: Callable = callback
        self._finished = finished
        self._active = True
        self._chunk_size = chunk_size

    @property
    def active(self) -> bool:
        return self._active

    def mark_finished(self):
        self._finished = True

    def stop(self):
        self._active = False

    def try_send_update(self) -> bool:
        """Try to read data from the underlying file object and
        send the update via the callback. Returns True iff some
        data was sent to the callback. This API should be used
        only by the FileStreamer class.
        """
        if not self.active:
            # Attempt to read from stopped stream
            return False

        try:
            data = self._file.read(self._chunk_size)
            if data:
                self._callback(data)
            elif self._finished:
                self.dispose()
            return bool(data)
        except Exception:
            logger.exception(f"Error while streaming the file: {self._file}")
            return False

    def dispose(self):
        """Ensure the stream is stopped and all resources are released.
        This API should only be used by the FileStreamer class."""
        self._active = False
        self._file.close()


class FileStreamer:
    def __init__(self, timeout: float = 0.1, chunk_size: int = 100 * 2**10):
        self._timeout: float = timeout
        self._chunk_size: int = chunk_size
        self._poll_condition = threading.Condition()
        self._streams: Set[_LogFileStream] = set()

    def _has_streams(self) -> bool:
        """Check if there are active streams."""
        return len(self._streams) > 0

    def start_stream(self, file, callback, finished=False):
        """Create a new file stream."""
        stream = _LogFileStream(file=file, callback=callback, finished=finished, chunk_size=self._chunk_size)
        with self._poll_condition:
            self._streams.add(stream)
            self._poll_condition.notify()
        return stream

    def _dispose_stopped_streams(self):
        """Dispose all stopped streams."""
        stopped_streams = [stream for stream in self._streams if not stream.active]
        for stream in stopped_streams:
            self._streams.remove(stream)
            try:
                stream.dispose()
            except Exception:
                logger.exception(f"Error while disposing inactive stream: {stream}")

    def _do_broadcast_updates(self):
        """Try to send data from each stream. Return True iff some data was sent."""
        updates_sent = False
        for stream in self._streams:
            updates_sent |= stream.try_send_update()
        return updates_sent

    def broadcast(self):
        """Poll the streams and send updates when available. This method
        is blocking, it could be executed in a background thread if needed."""
        while True:
            with self._poll_condition:
                self._poll_condition.wait_for(self._has_streams)
                self._dispose_stopped_streams()
                updates_sent = self._do_broadcast_updates()
                if not updates_sent:
                    time.sleep(self._timeout)
