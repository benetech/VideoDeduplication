import threading
from typing import Dict, Tuple

from server.queue.celery.file_streaming import BaseFileStream
from server.queue.celery.task_log_storage import TaskLogStorage
from server.socket import events, namespace as ns


class LogWatcher:
    def __init__(self, socketio, log_storage: TaskLogStorage):
        self._socketio = socketio
        self._log_storage: TaskLogStorage = log_storage
        self._streams: Dict[Tuple[str, str], BaseFileStream] = {}
        self._lock = threading.RLock()

    def subscribe(self, task_id: str, room_id: str, offset: int = 0):
        with self._lock:

            def emit_log_updates(data):
                print(f"SENDING: {task_id}, '{data}'")
                message = {"task_id": task_id, "data": data}
                self._socketio.emit(events.TASK_LOGS_UPDATED, message, namespace=ns.TASKS, to=room_id)

            stream = self._log_storage.stream_task_logs(task_id=task_id, callback=emit_log_updates, offset=offset)
            self._streams[(task_id, room_id)] = stream

    def unsubscribe(self, room_id: str, task_id: str):
        """Stop the given stream."""
        with self._lock:
            self._do_unsubscribe(task_id=task_id, room_id=room_id)

    def unsubscribe_task(self, task_id: str):
        """Stop all streams associated with the given task."""
        with self._lock:
            stream_keys = [(_task_id, room_id) for _task_id, room_id in self._streams.keys() if _task_id == task_id]
            for task_id, room_id in stream_keys:
                self._do_unsubscribe(task_id=task_id, room_id=room_id)

    def unsubscribe_room(self, room_id: str):
        """Stop all log streams associated with the given room."""
        with self._lock:
            stream_keys = [(task_id, _room_id) for task_id, _room_id in self._streams.keys() if _room_id == room_id]
            for task_id, room_id in stream_keys:
                self._do_unsubscribe(task_id=task_id, room_id=room_id)

    def _do_unsubscribe(self, task_id: str, room_id: str):
        """Stop single stream."""
        stream = self._streams.pop((task_id, room_id), None)
        if stream is not None:
            stream.stop()

    def broadcast_logs(self):
        """Broadcast log updates. This is a blocking method,
        you probably want to execute it in a background thread."""
        self._log_storage.broadcast_logs()
