import os

from celery import Celery

# Configuration parameters
BROKER = os.environ.get("CELERY_BROKER", "redis://localhost:6379/0")
BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

# Create application
celery_application = Celery("winnow-pipeline", broker=BROKER, backend=BACKEND, include=["task_queue.tasks"])
celery_application.conf.update(result_extended=True, worker_send_task_events=True, task_send_sent_event=True)

if __name__ == "__main__":
    # Apply celery config
    import task_queue.celery_config  # noqa

    celery_application.start()
