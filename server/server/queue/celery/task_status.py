from celery import states

from server.queue.model import TaskStatus

_KNOWN_STATES = {
    states.PENDING: TaskStatus.PENDING,
    states.STARTED: TaskStatus.RUNNING,
    states.REVOKED: TaskStatus.REVOKED,
    states.SUCCESS: TaskStatus.SUCCESS,
    states.FAILURE: TaskStatus.FAILURE,
}


def task_status(celery_state) -> TaskStatus:
    if celery_state not in _KNOWN_STATES:
        raise ValueError(f"Unknown celery state: {celery_state}")
    return _KNOWN_STATES[celery_state]
