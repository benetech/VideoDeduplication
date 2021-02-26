"""Basic abstractions for managing background task queue.

There are two main components of task execution system:

* Various specialized Tasks that could be created from the REST API requests
  and dispatched to the task queue, or serialized and provided to the client
  as a JSON.
* TaskQueue which accepts Tasks, allows Task life-cycle management, allows
  to handle various task-related events, provides API to list existing tasks, etc.
"""

from server.config import Config, QueueType
from server.queue.framework import TaskLogStorage, TaskQueue
from server.queue.request_transformer import RequestTransformer


def make_task_queue(config: Config, task_request_transformer: RequestTransformer) -> TaskQueue:
    """Create a task queue according to the configuration."""
    queue_type = config.task_queue_type
    if queue_type is QueueType.CELERY:
        from server.queue.celery import make_celery_task_queue

        return make_celery_task_queue(task_request_transformer)
    elif queue_type is QueueType.FAKE:
        from server.queue.fake.task_queue import FakeTaskQueue

        return FakeTaskQueue(transformer=task_request_transformer)


def make_log_storage(config: Config, task_queue) -> TaskLogStorage:
    """Make log storage according to the configuration."""
    queue_type = config.task_queue_type
    if queue_type is QueueType.CELERY:
        from server.queue.celery.task_logs import logs_path_resolver
        from server.queue.file_log_storage import LocalFileLogStorage

        log_storage = LocalFileLogStorage(path_resolver=logs_path_resolver(config.task_log_directory))
        log_storage.connect(queue=task_queue)
        return log_storage
    elif queue_type is QueueType.FAKE:
        return task_queue.log_storage
