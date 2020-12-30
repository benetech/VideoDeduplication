import logging
import os
import threading
from contextlib import contextmanager
from logging import LogRecord, Formatter

import celery
from celery import signals


class QueueLogHandler(logging.Handler):
    # Handler which is used when no task found
    _NULL = logging.NullHandler()

    @staticmethod
    def log_file_name(task_id):
        return f"task-{task_id}.log"

    def __init__(self, directory, mode="a", encoding=None, delay=False, level=logging.NOTSET):
        self._directory = directory
        self._mode = mode
        self._encoding = encoding
        self._delay = delay
        self._task_log_handlers = {}
        self._lock = threading.RLock()
        if not os.path.exists(self._directory):
            os.makedirs(self._directory)

        super().__init__(level=level)

        signals.task_prerun.connect(self._on_task_started)
        signals.task_retry.connect(self._on_task_started)
        signals.task_failure.connect(self._on_task_finished)

    @contextmanager
    def _protected(self):
        """Execute a protected section."""
        try:
            self._lock.acquire()
            yield
        finally:
            self._lock.release()

    def _determine_task(self, task_id=None, sender=None, request=None, **_):
        return task_id or (request is not None and request.id) or (sender is not None and sender.request.id)

    def _on_task_started(self, **kwargs):
        """Initialize log-file handler for a new task."""
        task_id = self._determine_task(**kwargs)
        if task_id is None:
            return
        with self._protected():
            if task_id not in self._task_log_handlers:
                self._task_log_handlers[task_id] = self._make_task_handler(task_id)

    def _on_task_finished(self, **kwargs):
        """Close log-file handler for a finished task."""
        task_id = self._determine_task(**kwargs)
        if task_id is None:
            return
        with self._protected():
            handler = self._task_log_handlers.pop(task_id, self._NULL)
            handler.close()

    def _get_current_task_id(self):
        task = celery.current_task
        if not task or task.name is None or task.request is None or task.request.id is None:
            return None
        if not task.name.startswith("task_queue.tasks."):
            return None
        return task.request.id

    def _make_task_handler(self, task_id) -> logging.Handler:
        log_file = os.path.join(self._directory, self.log_file_name(task_id))
        handler = logging.FileHandler(filename=log_file, mode=self._mode, encoding=self._encoding, delay=self._delay)
        handler.setLevel(self.level)
        handler.setFormatter(self.formatter)
        return handler

    def _get_handler(self) -> logging.Handler:
        task_id = self._get_current_task_id()
        return self._task_log_handlers.get(task_id, self._NULL)

    def createLock(self) -> None:
        handler = self._get_handler()
        handler.createLock()

    def acquire(self) -> None:
        handler = self._get_handler()
        handler.acquire()

    def release(self) -> None:
        handler = self._get_handler()
        handler.release()

    def setLevel(self, level) -> None:
        super().setLevel(level=level)
        with self._protected():
            for handler in self._task_log_handlers.values():
                handler.setLevel(leve=level)

    def setFormatter(self, fmt: Formatter) -> None:
        super().setFormatter(fmt)
        with self._protected():
            for handler in self._task_log_handlers.values():
                handler.setFormatter(fmt)

    def flush(self) -> None:
        handler = self._get_handler()
        handler.flush()

    def close(self) -> None:
        super().close()
        with self._protected():
            for handler in self._task_log_handlers.values():
                handler.close()
            self._task_log_handlers.clear()

    def handle(self, record: LogRecord) -> None:
        handler = self._get_handler()
        handler.handle(record)

    def handleError(self, record: LogRecord) -> None:
        handler = self._get_handler()
        handler.handleError(record)

    def format(self, record: LogRecord) -> str:
        handler = self._get_handler()
        return handler.format(record)

    def emit(self, record: LogRecord) -> None:
        handler = self._get_handler()
        return handler.emit(record)
