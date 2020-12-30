import threading

from server.socket import events, namespace as ns


class LogWatcher:
    def __init__(self, socketio, log_storage):
        self._socketio = socketio
        self._log_storage = log_storage
        self._observers = {}
        self._lock = threading.RLock()

    def subscribe(self, _task_id, room_id):
        with self._lock:
            observer_key = (_task_id, room_id)
            if observer_key in self._observers:
                return

            def observer(task_id, data):
                message = {"task_id": task_id, "data": data}
                self._socketio.emit(events.TASK_LOGS_UPDATED, message, namespace=ns.TASKS, to=room_id)

            self._observers[observer_key] = observer
            self._log_storage.watch(task_id=_task_id, observer=observer)

    def unsubscribe(self, room_id, task_id=None):
        with self._lock:
            if task_id is not None:
                self._do_unsubscribe(room_id=room_id, task_id=task_id)
                return
            # Unsubscribe from all task logs
            for current_task_id, current_room_id in self._observers.keys():
                if current_room_id == room_id:
                    self._do_unsubscribe(room_id=room_id, task_id=current_task_id)

    def _do_unsubscribe(self, room_id, task_id):
        observer_key = (task_id, room_id)
        if observer_key not in self._observers:
            return
        observer = self._observers[observer_key]
        self._log_storage.unwatch(task_id=task_id, observer=observer)
        del self._observers[observer_key]

    def publish_log_updates(self):
        self._log_storage.publish_log_updates()
