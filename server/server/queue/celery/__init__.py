from server.queue.model import ProcessDirectory, ProcessFileList, TestTask, MatchTemplates
from server.queue.request_transformer import RequestTransformer


def make_celery_task_queue(task_request_transformer: RequestTransformer):
    """Create a celery task queue."""
    from server.queue.celery.backend import resolve_backend
    from server.queue.celery.task_queue import CeleryTaskQueue
    from task_queue.application import celery_application
    from task_queue.tasks import test_fibonacci, process_file_list, process_directory, match_all_templates

    return CeleryTaskQueue(
        app=celery_application,
        backend=resolve_backend(celery_application),
        request_transformer=task_request_transformer,
        requests={
            ProcessDirectory: process_directory,
            ProcessFileList: process_file_list,
            MatchTemplates: match_all_templates,
            TestTask: test_fibonacci,
        },
    )
