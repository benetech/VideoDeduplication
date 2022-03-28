import logging
import logging.config
import os

from celery import signals

from task_queue.queue_log_handler import QueueLogHandler


@signals.after_setup_logger.connect
def configure_logging(**_):
    log_directory = os.environ.get("TASK_LOG_DIRECTORY", "./data/task_logs")
    handler = QueueLogHandler(directory=log_directory, level=logging.INFO)
    handler.setFormatter(logging.Formatter("[%(asctime)s: %(levelname)s] [%(name)s] %(message)s"))

    task_logger = logging.getLogger("celery.task")
    task_logger.addHandler(handler)
    task_logger.propagate = False

    luigi_iface_logger = logging.getLogger("luigi-interface")
    luigi_iface_logger.setLevel(logging.DEBUG)
    luigi_iface_logger.addHandler(handler)
    luigi_iface_logger.propagate = False

    luigi_task_logger = logging.getLogger("task")
    luigi_task_logger.setLevel(logging.INFO)
    luigi_task_logger.addHandler(handler)
    luigi_task_logger.propagate = False

    logging.root.addHandler(handler)
