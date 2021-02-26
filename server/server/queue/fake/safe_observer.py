import logging

from server.queue.framework import BaseObserver
from server.queue.model import Task

logger = logging.getLogger(__name__)


class SafeObserver(BaseObserver):
    """Wrapper that catches all observer exceptions."""

    def __init__(self, wrapped: BaseObserver):
        self._wrapped = wrapped

    def on_task_sent(self, task: Task):
        try:
            self._wrapped.on_task_sent(task)
        except Exception:
            logger.exception("Error occurred during handling on_task_sent event.")

    def on_task_started(self, task: Task):
        try:
            self._wrapped.on_task_started(task)
        except Exception:
            logger.exception("Error occurred during handling on_task_started event.")

    def on_task_succeeded(self, task: Task):
        try:
            self._wrapped.on_task_succeeded(task)
        except Exception:
            logger.exception("Error occurred during handling on_task_succeeded event.")

    def on_task_failed(self, task: Task):
        try:
            self._wrapped.on_task_failed(task)
        except Exception:
            logger.exception("Error occurred during handling on_task_failed event.")

    def on_task_revoked(self, task: Task):
        try:
            self._wrapped.on_task_revoked(task)
        except Exception:
            logger.exception("Error occurred during handling on_task_revoked event.")

    def on_task_meta_updated(self, task: Task):
        try:
            self._wrapped.on_task_meta_updated(task)
        except Exception:
            logger.exception("Error occurred during handling on_task_meta_updated event.")

    def on_task_deleted(self, task_id: str):
        try:
            self._wrapped.on_task_deleted(task_id)
        except Exception:
            logger.exception("Error occurred during handling on_task_deleted event.")
