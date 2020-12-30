import logging
import os
import select
import threading
from dataclasses import dataclass
from typing import Any

from server.queue.celery.base_observer import BaseObserver
from task_queue.queue_log_handler import QueueLogHandler

logger = logging.getLogger(__name__)


class _TaskObserver(BaseObserver):
    def __init__(self, storage):
        self._storage = storage

    def on_task_deleted(self, task_id):
        self._storage.delete_log_file(task_id)


@dataclass(frozen=True)
class WatchedFile:
    id: str
    fd: Any
    observers: set


class _LogFileWatcher:
    def __init__(self, log_storage, timeout=1000, block_size=100 * 2 ** 10):
        self._storage = log_storage
        self._timeout = timeout
        self._block_size = block_size
        self._lock = threading.RLock()
        self._poll = select.poll()
        self._files_by_fd = {}
        self._files_by_id = {}
        self._registered_fds = set()

    def watch(self, task_id, observer):
        with self._lock:
            if task_id not in self._files_by_id:
                path = self._storage.get_log_file()
                if path is None or not os.path.isfile(path):
                    return
                entry = WatchedFile(id=task_id, fd=open(path), observers={observer})
                self._files_by_fd[entry.fd] = entry
                self._files_by_id[entry.id] = entry
                logger.info(f"Start watching task logs: {task_id}")
            else:
                self._files_by_id[task_id].observers.add(observer)
            logger.info(f"New observer for task logs: {task_id}")

    def unwatch(self, task_id, observer=None):
        with self._lock:
            entry = self._files_by_id.get(task_id)
            if entry is None:
                return
            if observer is not None:
                logger.info(f"Remove observer of task logs: {task_id}")
                entry.observers.remove(observer)
            else:
                logger.info(f"Remove all observers of task logs: {task_id}")
                entry.observers.clear()
            if len(entry.observers) == 0:
                del self._files_by_id[entry.id]
                del self._files_by_fd[entry.fd]
                logger.info(f"Stop watching task logs: {task_id}")

    def _update_poll(self):
        with self._lock:
            current_fds = set(self._files_by_fd.keys())
            new_fds = current_fds - self._registered_fds
            del_fds = self._registered_fds - current_fds
            for fd in new_fds:
                self._poll.register(fd, select.POLLIN)
            for fd in del_fds:
                self._poll.unregister(fd)

    def _notify_observers(self, fd):
        with self._lock:
            if fd not in self._files_by_fd:
                os.close(fd)
                return
            entry = self._files_by_fd[fd]
            data = os.read(fd, self._block_size)
            for observer in entry.observers:
                observer(task_id=entry.id, data=data)

    def do_watch(self):
        while True:
            self._update_poll()
            for fd, _ in self._poll.poll(self._timeout):
                self._notify_observers(fd)


class TaskLogStorage:
    @staticmethod
    def log_file_name(task_id):
        """Get task log file name by id."""
        return QueueLogHandler.log_file_name(task_id)

    def __init__(self, directory):
        self.directory = os.path.abspath(directory)
        self._watcher = _LogFileWatcher(log_storage=self)

    def get_log_file(self, task_id):
        log_file_path = os.path.abspath(os.path.join(self.directory, self.log_file_name(task_id)))
        if os.path.dirname(log_file_path) != self.directory:
            logger.warning(f"Task id '{task_id}' points to the log file outside logs directory!")
            return None
        return log_file_path

    def delete_log_file(self, task_id):
        log_file_path = self.get_log_file(task_id)
        if log_file_path is not None and os.path.isfile(log_file_path):
            os.remove(log_file_path)

    def make_task_observer(self) -> BaseObserver:
        return _TaskObserver(storage=self)

    def watch(self, task_id, observer):
        self._watcher.watch(task_id, observer)

    def unwatch(self, task_id, observer=None):
        self._watcher.unwatch(task_id, observer)

    def publish_log_updates(self):
        self._watcher.do_watch()
