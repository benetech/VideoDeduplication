import threading
import time
from dataclasses import asdict
from datetime import datetime
from typing import Optional, Tuple, List, Dict, Set
from uuid import uuid4 as uuid

from server.queue.fake.log_storage import FakeTaskLogStorage
from server.queue.fake.safe_observer import SafeObserver
from server.queue.framework import TaskQueue, BaseObserver, StatusFilterSpec, TaskLogStorage
from server.queue.model import Task, Request, TaskStatus
from server.queue.request_transformer import RequestTransformer
from server.queue.task_utils import task_status_filter


class FakeTaskQueue(TaskQueue):
    def __init__(self, transformer: RequestTransformer, maxtasks=100):
        self._transformer = transformer
        self._tasks: Dict[str, Task] = {}
        self._observers: Set[BaseObserver] = set()
        self._lock = threading.RLock()
        self._condition = threading.Condition(lock=self._lock)
        self._maxtasks = maxtasks
        self._log_storage = FakeTaskLogStorage()

    @property
    def log_storage(self) -> TaskLogStorage:
        """Get fake log storage."""
        return self._log_storage

    def dispatch(self, request: Request) -> Task:
        """Dispatch a new task."""
        with self._lock:
            task = self._make_task(request)

            # Add task to pending list
            self._tasks[task.id] = task
            self._evict()
            self._condition.notify()

            # Notify observers
            for observer in self._observers:
                observer.on_task_sent(self._clone(task))

        return self._clone(task)

    def terminate(self, task_id: str):
        """Terminate task by id."""
        with self._lock:

            # Make sure task exists
            task = self._tasks.get(task_id)
            if task is None:
                return

            # Check if task is revocable
            revocable = {TaskStatus.RUNNING, TaskStatus.PENDING}
            if task.status not in revocable:
                return

            # Revoke task
            task.status = TaskStatus.REVOKED
            task.status_updated = datetime.now()
            for observer in self._observers:
                observer.on_task_revoked(self._clone(task))

    def delete(self, task_id: str):
        """Delete task by id."""
        with self._lock:

            # Make sure task exists
            task = self._tasks.get(task_id)
            if task is None:
                return

            # Terminate and delete task
            self.terminate(task.id)
            del self._tasks[task.id]
            self._log_storage.delete_logs(task_id)
            for observer in self._observers:
                observer.on_task_deleted(task.id)

    def get_task(self, task_id: str) -> Optional[Task]:
        """Get task by id."""
        with self._lock:
            task = self._tasks.get(task_id)
            if task is not None:
                return self._clone(task)

    def list_tasks(self, status: Optional[StatusFilterSpec] = None, offset=0, limit=None) -> Tuple[List, int]:
        """List tasks with the given status."""
        with self._lock:
            selected_tasks = list(filter(task_status_filter(status), self._tasks.values()))
            limit = limit or len(selected_tasks)
            return selected_tasks[offset : offset + limit], len(selected_tasks)

    def exists(self, task_id: str) -> bool:
        """Check if task with the given id exists."""
        with self._lock:
            return task_id in self._tasks

    def observe(self, observer: BaseObserver):
        """Add observer to the queue notification list."""
        with self._lock:
            self._observers.add(SafeObserver(wrapped=observer))

    def stop_observing(self, observer: BaseObserver):
        """Remove observer from the queue notification list."""
        with self._lock:
            if observer in self._observers:
                self._observers.remove(observer)

    def listen(self):
        """Listen for queue events and notify observers.

        This is a blocking method, it should be executed in a background thread.
        """
        while True:
            task = self._select_and_start_task()
            self._execute_task(task)

    def _select_and_start_task(self) -> Task:
        """Select pending task."""
        with self._condition:
            selected = self._find_pending_task()
            while selected is None:
                self._condition.wait()
                selected = self._find_pending_task()
            selected.status = TaskStatus.RUNNING
            selected.status_updated = datetime.now()
            for observer in self._observers:
                observer.on_task_started(self._clone(selected))
            return selected

    def _find_pending_task(self) -> Optional[Task]:
        """Try to find available pending task."""
        with self._lock:
            pending = filter(task_status_filter(TaskStatus.PENDING), self._tasks.values())
            return min(pending, default=None, key=lambda task: task.created)

    def _execute_task(self, task: Task):
        """Emulate task execution."""
        total_seconds = 30
        logs = self._log_storage.create_logs(task.id)
        for i in range(total_seconds):
            logs.append(f"[{datetime.now()} INFO] Extracting signature for file {i} of {total_seconds}\n")
            time.sleep(1)
            with self._lock:
                if task.status is not TaskStatus.RUNNING:
                    logs.finish()
                    return
                task.progress = float(i + 1) / total_seconds
                for observer in self._observers:
                    observer.on_task_meta_updated(self._clone(task))
        with self._lock:
            logs.finish()
            task.status = TaskStatus.SUCCESS
            task.status_updated = datetime.now()
            for observer in self._observers:
                observer.on_task_succeeded(self._clone(task))

    def _clone(self, task: Task) -> Task:
        """Clone task."""
        result = Task(**asdict(task))
        result.request = self._clone_req(task.request)
        return result

    def _clone_req(self, request: Request) -> Request:
        """Clone task request."""
        return self._transformer.fromdict(request.asdict())

    def _make_task(self, request: Request) -> Task:
        """Create a new task instance from the request."""
        return Task(
            id=str(uuid()),
            created=datetime.now(),
            status_updated=datetime.now(),
            request=self._clone_req(request),
            status=TaskStatus.PENDING,
        )

    def _evict(self):
        """Evict tasks exceeding limits."""
        with self._lock:
            evict_count = max(0, len(self._tasks) - self._maxtasks)
            if evict_count == 0:
                return

            not_running = set(TaskStatus) - {TaskStatus.RUNNING}
            inactive_tasks = list(filter(task_status_filter(not_running), self._tasks.values()))
            inactive_tasks.sort(key=lambda task: task.created)
            to_be_evicted = inactive_tasks[:evict_count]

            for evicted_task in to_be_evicted:
                del self._tasks[evicted_task.id]
                self._log_storage.delete_logs(evicted_task.id)
                for observer in self._observers:
                    observer.on_task_deleted(evicted_task.id)
