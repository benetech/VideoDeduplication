import logging
import os

from celery import signals

from task_queue.log import QueueLogHandler


@signals.celeryd_after_setup.connect
def configure_logging(**_):
    log_directory = os.environ.get("CELERY_LOG_FOLDER", "./data/task_logs")
    logging.root.addHandler(QueueLogHandler(directory=log_directory))
