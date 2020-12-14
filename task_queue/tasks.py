import time

from celery.utils.log import get_task_logger

from .application import celery_application

logger = get_task_logger(__name__)


@celery_application.task
def run_pipeline():
    """Run a video-deduplication pipeline."""
    logger.info("Task is received!")
    time.sleep(10)
    return 42
