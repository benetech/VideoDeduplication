import logging
from functools import wraps

from celery import states

from . import events
from .application import celery_application
from .events import RUNTIME_METADATA_ATTR

winnow_logger = logging.getLogger(__name__)


class WinnowTask(celery_application.Task):
    def update_metadata(self, meta=None, task_id=None):
        """Update task runtime metadata."""
        if task_id is None and self.request is not None:
            task_id = self.request.id
        if task_id is None:
            raise RuntimeError("task_id is None")
        fields = {RUNTIME_METADATA_ATTR: meta.asdict()}
        self.send_event(type_=events.TASK_METADATA, **fields)


def winnow_task(*args, base=None, **opts):
    """Decorator to declare winnow Celery tasks.

    The winnow_task decorator ensures that the correct celery application and
    correct task base class (WinnowTask) are used. The WinnowTask API is
    available for @winnow_task() tasks.
    """

    if base is not None:
        raise ValueError("Winnow tasks cannot override base class.")

    def create_winnow_task_decorator(*arguments, **options):
        """Create an actual decorator."""

        def decorator(task):
            """Wrap task routine."""

            @wraps(task)
            def wrapper(self, *task_args, **task_kwargs):
                """Task wrapper that ensures the bootstrapping behavior."""
                if options.get("bind", False):
                    task_args = (self,) + task_args
                self.update_state(state=states.STARTED)
                try:
                    return task(*task_args, **task_kwargs)
                except Exception as exc:
                    winnow_logger.exception(f"Task raised exception: {exc}")
                    raise

            return celery_application.task(base=WinnowTask, *arguments, **options)(wrapper)

        return decorator

    if len(args) == 1 and callable(args[0]):
        return create_winnow_task_decorator(**opts)(args[0])
    return create_winnow_task_decorator(*args, **opts)
