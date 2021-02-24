from server.queue.celery import make_celery_task_queue
from server.queue.model import ProcessDirectory, ProcessFileList, TestTask
from server.queue.request_transformer import RequestTransformer

request_transformer = RequestTransformer(ProcessDirectory, ProcessFileList, TestTask)

task_queue = make_celery_task_queue(request_transformer)
