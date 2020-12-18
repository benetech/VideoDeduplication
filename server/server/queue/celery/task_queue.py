import inspect
from datetime import datetime

from celery.utils import uuid

from server.queue.celery.task_metadata import TaskMetadata
from server.queue.celery.task_status import task_status
from server.queue.model import Task, TaskStatus, TaskError


def _task_name(task):
    return task.__qualname__


def _task_filter(status=None):
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


class CeleryTaskQueue:
    def __init__(self, app, backend, request_transformer, requests):
        if app is None:
            raise ValueError("Celery app cannot be None")
        self.app = app
        self._celery_backend = backend
        self._celery_tasks = {}
        self._req_transformer = request_transformer
        for request_type, task in requests.items():
            self._celery_tasks[request_type] = task

    def dispatch(self, request):
        # Resolve actual celery task to be invoked
        celery_task = self._get_celery_task(request)

        # Make sure the backend contains required task metadata
        task_id = uuid()
        meta = TaskMetadata(id=task_id, created=datetime.utcnow(), request=request)
        self._celery_backend.store_task_meta(task_id, meta.asdict())

        # Invoke celery task
        celery_task.apply_async(task_id=task_id, kwargs=request.kwargs())

        # Create a new task instance and return to the caller
        return Task(
            id=task_id, created=meta.created, status_updated=meta.created, request=request, status=TaskStatus.PENDING
        )

    def _get_celery_task(self, request):
        if type(request) not in self._celery_tasks:
            raise ValueError(f"Unsupported request type: {type(request)}")
        return self._celery_tasks[type(request)]

    def terminate(self, task_id):
        if self.exists(task_id):
            async_result = self.app.AsyncResult(task_id)
            async_result.revoke(terminate=True, wait=False)

    def delete(self, task_id):
        self.terminate(task_id)
        if self.exists(task_id):
            self._celery_backend.delete_task_meta(task_id)
            async_result = self.app.AsyncResult(task_id)
            async_result.forget()

    def get_task(self, task_id):
        return self._construct_task(task_id, {})

    def _construct_task(self, task_id, active_task_meta):
        raw_meta = self._celery_backend.get_task_meta(task_id)
        if raw_meta is None:
            return None
        winnow_meta = TaskMetadata.fromdict(raw_meta, self._req_transformer)
        async_result = self.app.AsyncResult(task_id)

        status = task_status(async_result.status)
        status_updated = winnow_meta.created
        if task_id in active_task_meta:
            status = TaskStatus.RUNNING
            status_updated = datetime.utcfromtimestamp(active_task_meta[task_id]["time_start"])
        if status != TaskStatus.PENDING and status != TaskStatus.RUNNING:
            status_updated = async_result.date_done
        error = None
        if status == TaskStatus.FAILURE:
            error = self._construct_error(async_result)
        return Task(
            id=winnow_meta.id,
            created=winnow_meta.created,
            status_updated=status_updated,
            request=winnow_meta.request,
            status=status,
            error=error,
        )

    def _construct_error(self, async_result):
        exc_type_name = None
        exc_module_name = None
        exc_message = None
        result = async_result.result
        if isinstance(result, Exception):
            exc_type = type(result)
            exc_type_name = getattr(exc_type, "__name__", None)
            exc_module = inspect.getmodule(exc_type)
            if exc_module is not None:
                exc_module_name = getattr(exc_module, "__name__", None)
            exc_message = str(result)
        return TaskError(
            exc_type=exc_type_name,
            exc_message=exc_message,
            exc_module=exc_module_name,
            traceback=async_result.traceback,
        )

    def _active_tasks_meta(self):
        metadata_index = {}
        celery_inspector = self.app.control.inspect()
        for metadata_entries in celery_inspector.active().values():
            for task_metadata in metadata_entries:
                metadata_index[task_metadata["id"]] = task_metadata
        return metadata_index

    def list_tasks(self, status=None, offset=0, limit=None):
        satisfies = _task_filter(status)
        result = []
        filtered_count = 0
        for task_id in self._celery_backend.task_ids():
            task = self._construct_task(task_id, {})
            task_satisfies = satisfies(task)
            if task_satisfies and offset <= filtered_count < offset + limit:
                result.append(task)
            filtered_count += int(task_satisfies)
        return result, filtered_count

    def exists(self, task_id):
        return self._celery_backend.exists(task_id=task_id)

    def observe(self, observer):
        """Listen to the celery events and notify observers.

        This is a blocking method that should be executed in a background thread.
        """
        state = self.app.events.State()

        def announce_task_sent(event):
            """Sent when a task message is published."""
            state.event(event)
            task = self.get_task(event["uuid"])
            if task is not None:
                observer.on_task_sent(task)

        def announce_task_started(event):
            """Sent just before the worker executes the task."""
            state.event(event)
            task = self.get_task(event["uuid"])
            task.status = TaskStatus.RUNNING
            if task is not None:
                observer.on_task_started(task)

        def announce_succeeded_tasks(event):
            """Sent if the task executed successfully."""
            state.event(event)
            task = self.get_task(event["uuid"])
            if task is not None:
                observer.on_task_succeeded(task)

        def announce_failed_tasks(event):
            """Sent if the execution of the task failed."""
            state.event(event)
            task = self.get_task(event["uuid"])
            if task is not None:
                observer.on_task_failed(task)

        def announce_revoked_tasks(event):
            """Sent if the task has been revoked."""
            state.event(event)
            task = self.get_task(event["uuid"])
            if task is not None:
                observer.on_task_revoked(task)

        with self.app.connection() as connection:
            receiver = self.app.events.Receiver(
                connection,
                handlers={
                    "task-sent": announce_task_sent,
                    "task-started": announce_task_started,
                    "task-succeeded": announce_succeeded_tasks,
                    "task-failed": announce_failed_tasks,
                    "task-revoked": announce_revoked_tasks,
                },
            )
            receiver.capture(limit=None, timeout=None, wakeup=True)
