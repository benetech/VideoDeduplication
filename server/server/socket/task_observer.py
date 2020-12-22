from server.queue.celery.base_observer import BaseObserver
from server.socket import events, namespace as ns


class TaskObserver(BaseObserver):
    """Notify all socket-io clients on all task updates."""

    def __init__(self, socketio):
        self._socketio = socketio

    def _emit_task_update(self, task):
        self._socketio.emit(events.TASK_UPDATED, task.asdict(), namespace=ns.TASKS)

    def on_task_sent(self, task):
        self._emit_task_update(task)

    def on_task_started(self, task):
        self._emit_task_update(task)

    def on_task_succeeded(self, task):
        self._emit_task_update(task)

    def on_task_failed(self, task):
        self._emit_task_update(task)

    def on_task_revoked(self, task):
        self._emit_task_update(task)

    def on_task_meta_updated(self, task):
        self._emit_task_update(task)
