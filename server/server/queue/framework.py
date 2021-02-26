import abc
import os
from typing import Tuple, List, Iterable, Union, Optional, TextIO

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
    def get_task(self, task_id: str) -> Optional[Task]:
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


class LogStream(abc.ABC):
    """Abstract base class for task logs stream."""

    @property
    @abc.abstractmethod
    def active(self) -> bool:
        """Check if the stream is active. Active stream will
        send data updates as they get available."""

    @abc.abstractmethod
    def mark_finished(self):
        """The stream will automatically stop itself
        once no more data is available in the file."""
        raise NotImplementedError()

    @abc.abstractmethod
    def stop(self):
        """Stop the stream.

        Once stopped stream will not broadcast any updates, all
        resources (open file descriptors, etc.) will be released."""
        pass


class TaskLogStorage(abc.ABC):
    """Abstract base class for log storage implementations."""

    @abc.abstractmethod
    def get_logs(self, task_id: str) -> Optional[TextIO]:
        """Get task logs as file-like object."""

    @abc.abstractmethod
    def delete_logs(self, task_id: str):
        """Delete task logs."""

    @abc.abstractmethod
    def connect(self, queue: TaskQueue):
        """Receive updates from task queue."""

    @abc.abstractmethod
    def stream_logs(self, task_id, callback, offset=0, whence=os.SEEK_SET) -> Optional[LogStream]:
        """Start a new task logs stream."""

    @abc.abstractmethod
    def serve_streams(self):
        """Broadcast log updates. This is a blocking method, you
        probably want to execute it in a background thread."""


class TaskQueueError(Exception):
    """Error in task queue operation."""


class TaskQueueUnavailable(Exception):
    """The request cannot be served property because queue is not available or overloaded."""
