import threading
from collections import deque
from dataclasses import asdict
from datetime import datetime
from queue import Queue
from typing import Optional, Tuple, List, Deque, Set
from uuid import uuid4 as uuid

from server.queue.framework import TaskQueue, BaseObserver, StatusFilterSpec
from server.queue.model import Task, Request, TaskStatus
from server.queue.request_transformer import RequestTransformer
from server.queue.task_utils import task_status_filter


class FakeTaskQueue(TaskQueue):
    def __init__(self, transformer: RequestTransformer, maxtasks=100):
        self._transformer = transformer
        self._pending = Queue()
        self._active: Optional[Task] = None
        self._tasks: Deque[Task] = deque()
        self._observers: Set[BaseObserver] = set()
        self._lock = threading.RLock()
        self._maxtasks = maxtasks

    def dispatch(self, request: Request) -> Task:
        """Dispatch a new task."""
        with self._lock:
            task = Task(
                id=str(uuid()),
                created=datetime.now(),
                status_updated=datetime.now(),
                request=self._clone_req(request),
                status=TaskStatus.PENDING,
            )
            # Evict tasks exceeding task limit
            self._tasks.appendleft(task)
            while len(self._tasks) > self._maxtasks:
                self._tasks.pop()

            if len(self._pending) > self._maxtasks:
                return None

            # Add task to the queue
            self._pending.put(task)

            # Notify observers
            for observer in self._observers:
                observer.on_task_sent(self._clone(task))

        return self._clone(task)

    def terminate(self, task_id: str):
        """Terminate task by id."""
        with self._lock:
            task = self.get_task(task_id)
            if task is None or task.status not in (TaskStatus.RUNNING, TaskStatus.PENDING):
                return
            task.status = TaskStatus.REVOKED
            for observer in self._observers:
                observer.on_task_revoked(self._clone(task))

    def delete(self, task_id: str):
        """Delete task by id."""
        with self._lock:
            task = self.get_task(task_id)
            if task is None:
                return
            self.terminate(task.id)
            self._tasks

    def get_task(self, task_id: str) -> Task:
        """Get task by id."""
        with self._lock:
            return self._clone(self._get_task(task_id))

    def _get_task(self, task_id: str) -> Task:
        """Get canonical task instance."""
        with self._lock:
            for task in self._tasks:
                if task.id == task_id:
                    return task
        return None

    def list_tasks(self, status: Optional[StatusFilterSpec] = None, offset=0, limit=None) -> Tuple[List, int]:
        """List tasks with the given status."""
        with self._lock:
            selected_tasks = list(filter(task_status_filter(status), self._tasks))
            limit = limit or len(selected_tasks)
            return selected_tasks[offset : offset + limit]

    def exists(self, task_id: str) -> bool:
        """Check if task with the given id exists."""
        with self._lock:
            return self._get_task(task_id) is not None

    def observe(self, observer: BaseObserver):
        """Add observer to the queue notification list."""
        with self._lock:
            self._observers.add(observer)

    def stop_observing(self, observer: BaseObserver):
        """Remove observer from the queue notification list."""
        with self._lock:
            if observer in self._observers:
                self._observers.remove(observer)

    def listen(self):
        """Listen for queue events and notify observers.

        This is a blocking method, it should be executed in a background thread.
        """
        pass

    def _clone(self, task: Task) -> Task:
        """Clone task."""
        result = Task(**asdict(task))
        result.request = self._clone_req(task.request)
        return result

    def _clone_req(self, request: Request) -> Request:
        """Clone task request."""
        return self._transformer.fromdict(request.asdict())
