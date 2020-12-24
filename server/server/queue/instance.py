from server.queue.celery.backend import resolve_backend
from server.queue.celery.task_log_storage import TaskLogStorage
from server.queue.celery.task_queue import CeleryTaskQueue
from server.queue.model import ProcessDirectory, ProcessFileList, TestTask
from server.queue.request_transformer import RequestTransformer
from task_queue.application import celery_application
from task_queue.tasks import process_directory, process_file_list, test_fibonacci

request_transformer = RequestTransformer(ProcessDirectory, ProcessFileList, TestTask)

queue = CeleryTaskQueue(
    app=celery_application,
    backend=resolve_backend(celery_application),
    request_transformer=request_transformer,
    requests={ProcessDirectory: process_directory, ProcessFileList: process_file_list, TestTask: test_fibonacci},
)

log_storage = TaskLogStorage()
