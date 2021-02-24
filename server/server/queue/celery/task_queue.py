import inspect
import logging
from datetime import datetime
from typing import Optional, Set, Callable

from celery.utils import uuid
from server.queue.celery.base_observer import BaseObserver

from server.queue.celery.task_metadata import TaskMetadata
from server.queue.celery.task_status import task_status
from server.queue.model import Task, TaskStatus, TaskError
from server.queue.task_utils import task_status_filter
from task_queue.events import TASK_METADATA, RUNTIME_METADATA_ATTR
from task_queue.metadata import TaskRuntimeMetadata

# Default module logger
logger = logging.getLogger(__name__)


def _task_name(task):
    return task.__qualname__


class CeleryTaskQueue:

    # Event type for task deletion
    TASK_DELETED_EVENT = "task-deleted"

    def __init__(self, app, backend, request_transformer, requests):
        if app is None:
            raise ValueError("Celery app cannot be None")
        self.app = app
        self._celery_backend = backend
        self._celery_tasks = {}
        self._req_transformer = request_transformer
        for request_type, task in requests.items():
            self._celery_tasks[request_type] = task
        self._observers: Set[BaseObserver] = set()

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
            self._notify_deleted(task_id)

    def get_task(self, task_id):
        return self._construct_task(task_id, {})

    def _construct_task(self, task_id, active_task_meta):
        winnow_meta = self._get_task_meta(task_id)
        async_result = self.app.AsyncResult(task_id)

        if winnow_meta is None:
            return None

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
            progress=winnow_meta.progress,
        )

    def _get_task_meta(self, task_id, transaction=None) -> Optional[TaskMetadata]:
        raw_meta = self._celery_backend.get_task_meta(task_id, transaction=transaction)
        if raw_meta is None:
            return None
        return TaskMetadata.fromdict(raw_meta, self._req_transformer)

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
        satisfies = task_status_filter(status)
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

    def _make_event_handler(self, state, task_handler: Callable[[Task], None]):
        """Create Celery event-receiver callback, which will accept Celery
        events, create a task and pass the task to the actual handler.
        """

        def event_handler(event):
            """Receive event and pass the corresponding task to the handler."""
            state.event(event)
            self._update_meta_from_event(event)
            task = self.get_task(event["uuid"])
            if task is not None:
                task_handler(task)

        return event_handler

    def _notify(self, state, task_handler: Callable[[Task, BaseObserver], None]):
        """Create task handler that loops over the existing observers and apply the provided operation."""

        def notifier(task):
            """Notify each observer with the given task"""
            for observer in self._observers:
                try:
                    task_handler(task, observer)
                except Exception:
                    logger.exception("Error handling task update")

        return self._make_event_handler(state, notifier)

    def _update_meta_from_event(self, event):
        """Try to read TaskRuntimeMetadata from event and save it to the backend."""
        if RUNTIME_METADATA_ATTR not in event:
            return
        task_id = event["uuid"]

        try:
            with self._celery_backend.transaction(task_id) as txn:
                task_metadata = self._get_task_meta(task_id, transaction=txn)
                if task_metadata is None:
                    return
                runtime_metadata = TaskRuntimeMetadata.fromdict(event[RUNTIME_METADATA_ATTR])
                task_metadata.progress = runtime_metadata.progress
                self._celery_backend.begin_write_section(transaction=txn)  # Necessary for redis transactions
                self._celery_backend.store_task_meta(task_id, task_metadata.asdict(), transaction=txn)
        except Exception:
            logger.exception("Cannot update task metadata")

    def observe(self, observer: BaseObserver):
        """Add observer to the queue notification list."""
        self._observers.add(observer)

    def stop_observing(self, observer: BaseObserver):
        """Remove observer from the queue notification list."""
        self._observers.remove(observer)

    def _notify_deleted(self, task_id):
        """Send task-deleted event via the Celery message bus."""
        retry_policy = self.app.conf.task_publish_retry_policy
        with self.app.events.default_dispatcher() as dispatcher:
            dispatcher.send(type=self.TASK_DELETED_EVENT, uuid=task_id, retry=True, retry_policy=retry_policy)

    def listen(self):
        """Listen for queue events and notify observers.

        This is a blocking method, it should be executed in a background thread.
        """

        def handle_started(task):
            """Do handle task-started event."""
            # This is safe to force the RUNNING state
            # because "state-failed" and "state-succeeded"
            # events will be handled after that.
            task.status = TaskStatus.RUNNING
            for observer in self._observers:
                try:
                    observer.on_task_started(task)
                except Exception:
                    logger.exception("Error handling 'task-started' event")

        def announce_task_deleted(event):
            """Do handle task-deleted event."""
            task_id = event["uuid"]
            for observer in self._observers:
                try:
                    observer.on_task_deleted(task_id)
                except Exception:
                    logger.exception(f"Error handling '{self.TASK_DELETED_EVENT}' event")

        state = self.app.events.State()
        announce_task_sent = self._notify(state, lambda task, observer: observer.on_task_sent(task))
        announce_task_started = self._make_event_handler(state, handle_started)
        announce_succeeded_tasks = self._notify(state, lambda task, observer: observer.on_task_succeeded(task))
        announce_failed_tasks = self._notify(state, lambda task, observer: observer.on_task_failed(task))
        announce_revoked_tasks = self._notify(state, lambda task, observer: observer.on_task_revoked(task))
        announce_metadata_update = self._notify(state, lambda task, observer: observer.on_task_meta_updated(task))

        with self.app.connection() as connection:
            receiver = self.app.events.Receiver(
                connection,
                handlers={
                    "task-sent": announce_task_sent,
                    "task-started": announce_task_started,
                    "task-succeeded": announce_succeeded_tasks,
                    "task-failed": announce_failed_tasks,
                    "task-revoked": announce_revoked_tasks,
                    TASK_METADATA: announce_metadata_update,
                    self.TASK_DELETED_EVENT: announce_task_deleted,
                },
            )
            receiver.capture(limit=None, timeout=None, wakeup=True)
