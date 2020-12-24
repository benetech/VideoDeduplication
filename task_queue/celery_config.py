import logging
import os

from celery import signals

from task_queue.queue_log_handler import QueueLogHandler


@signals.after_setup_logger.connect
def configure_logging(**_):
    log_directory = os.environ.get("CELERY_LOG_FOLDER", "./data/task_logs")
    handler = QueueLogHandler(directory=log_directory, level=logging.INFO)
    handler.setFormatter(logging.Formatter("[%(asctime)s: %(levelname)s] [%(name)s] %(message)s"))
    task_logger = logging.getLogger("celery.task")
    task_logger.addHandler(handler)
    task_logger.propagate = True
    logging.root.addHandler(handler)
