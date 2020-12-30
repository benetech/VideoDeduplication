from flask import request

from server.api.helpers import get_log_watcher
from server.socket import events, namespace as ns
from server.socket.instance import socketio


@socketio.on("disconnect", namespace=ns.TASKS)
def disconnect():
    log_watcher = get_log_watcher()
    log_watcher.unsubscribe(room_id=request.sid)


@socketio.on(events.TASK_LOGS_SUBSCRIBE, namespace=ns.TASKS)
def subscribe_logs(message):
    task_id = message.get("task_id")
    if task_id is None:
        return
    log_watcher = get_log_watcher()
    log_watcher.subscribe(_task_id=task_id, room_id=request.sid)


@socketio.on(events.TASK_LOGS_UNSUBSCRIBE, namespace=ns.TASKS)
def unsubscribe_logs(message):
    task_id = message.get("task_id")
    log_watcher = get_log_watcher()
    log_watcher.unsubscribe(room_id=request.sid, task_id=task_id)
