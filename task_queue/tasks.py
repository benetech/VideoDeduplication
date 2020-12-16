import time

from celery.utils.log import get_task_logger

from .application import celery_application

logger = get_task_logger(__name__)


@celery_application.task
def process_directory(directory):
    logger.info(f"Task is received: {directory}")
    time.sleep(10)
    return 42


@celery_application.task
def process_file_list(files):
    logger.info(f"Task is received: {files}")
    time.sleep(10)
    return 42
