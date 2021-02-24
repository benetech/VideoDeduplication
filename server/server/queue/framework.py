import abc
from typing import Tuple, List, Iterable, Union, Optional

from server.queue.model import TaskStatus, Task, Request


class BaseObserver:
    """Basic task queue observer, ignores all events by default."""

    def on_task_sent(self, task: Task):
        """Fires when a task message is published."""
        pass

    def on_task_started(self, task: Task):
        """Fires just before the worker executes the task."""
        pass

    def on_task_succeeded(self, task: Task):
        """Fires if the task executed successfully."""
        pass

    def on_task_failed(self, task: Task):
        """Fires if the execution of the task failed."""
        pass

    def on_task_revoked(self, task: Task):
        """Fires if the task has been revoked."""
        pass

    def on_task_meta_updated(self, task: Task):
        """Fires when task runtime metadata is updated."""
        pass

    def on_task_deleted(self, task_id: str):
        """Fires when task is deleted from the queue."""
        pass


# Status filter spec is either an iterable of statuses or a single status.
StatusFilterSpec = Union[Iterable[TaskStatus], TaskStatus]


class TaskQueue(abc.ABC):
    """Abstract base class for pipeline task queue."""

    @abc.abstractmethod
    def dispatch(self, request: Request) -> Task:
        """Dispatch a new task."""

    @abc.abstractmethod
    def terminate(self, task_id: str):
        """Terminate task by id."""

    @abc.abstractmethod
    def delete(self, task_id: str):
        """Delete task by id."""

    @abc.abstractmethod
    def get_task(self, task_id: str) -> Task:
        """Get task by id."""

    @abc.abstractmethod
    def list_tasks(self, status: Optional[StatusFilterSpec] = None, offset=0, limit=None) -> Tuple[List, int]:
        """List tasks with the given status."""

    @abc.abstractmethod
    def exists(self, task_id: str) -> bool:
        """Check if task with the given id exists."""

    @abc.abstractmethod
    def observe(self, observer: BaseObserver):
        """Add observer to the queue notification list."""

    @abc.abstractmethod
    def stop_observing(self, observer: BaseObserver):
        """Remove observer from the queue notification list."""

    @abc.abstractmethod
    def listen(self):
        """Listen for queue events and notify observers.

        This is a blocking method, it should be executed in a background thread.
        """
