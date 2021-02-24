from typing import Optional, Union, Callable, Iterable

from server.queue.model import TaskStatus, Task

# Status filter spec is either an iterable of statuses or a single status.
StatusFilterSpec = Union[Iterable[TaskStatus], TaskStatus]


def task_status_filter(status: Optional[StatusFilterSpec] = None) -> Callable[[Task], bool]:
    """Make task status filter."""
    if status is None:
        status = set(TaskStatus)
    elif isinstance(status, TaskStatus):
        status = {status}
    else:
        status = set(status)

    def task_filter(task):
        if task is None:
            return False
        return task.status in status

    return task_filter
