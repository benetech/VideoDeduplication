from server.queue.model import (
    ProcessDirectory,
    ProcessFileList,
    TestTask,
    MatchTemplates,
    FindFrame,
    ProcessOnlineVideo,
    PushFingerprints,
    PullFingerprints,
    MatchRemoteFingerprints,
    PrepareSemanticSearch,
    GenerateTiles,
)
from server.queue.request_transformer import RequestTransformer


def make_celery_task_queue(task_request_transformer: RequestTransformer):
    """Create a celery task queue."""
    from server.queue.celery.backend import resolve_backend
    from server.queue.celery.task_queue import CeleryTaskQueue
    from task_queue.application import celery_application
    from task_queue.tasks import (
        test_fibonacci,
        process_file_list,
        process_directory,
        match_all_templates,
        find_frame_task,
        process_online_video,
        push_fingerprints_task,
        pull_fingerprints_task,
        match_remote_fingerprints,
        prepare_semantic_search,
        generate_tiles,
    )

    return CeleryTaskQueue(
        app=celery_application,
        backend=resolve_backend(celery_application),
        request_transformer=task_request_transformer,
        requests={
            ProcessDirectory: process_directory,
            ProcessFileList: process_file_list,
            MatchTemplates: match_all_templates,
            FindFrame: find_frame_task,
            ProcessOnlineVideo: process_online_video,
            TestTask: test_fibonacci,
            PushFingerprints: push_fingerprints_task,
            PullFingerprints: pull_fingerprints_task,
            MatchRemoteFingerprints: match_remote_fingerprints,
            PrepareSemanticSearch: prepare_semantic_search,
            GenerateTiles: generate_tiles,
        },
    )
