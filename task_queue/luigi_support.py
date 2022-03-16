import os

import luigi

from task_queue.metadata import TaskRuntimeMetadata
from winnow.pipeline.luigi.platform import JusticeAITask
from winnow.pipeline.progress_monitor import ProgressMonitor


class LuigiRootProgressMonitor(ProgressMonitor):
    """Root progress monitor to track progress made by entire multitask run."""

    def __init__(self, celery_task):
        def update_progress(progress, _):
            """Send a metadata update."""
            celery_task.update_metadata(TaskRuntimeMetadata(progress=progress))

        super().__init__(update_progress)
        self._seen_tasks = set()
        JusticeAITask.event_handler(luigi.Event.DEPENDENCY_DISCOVERED)(self._update_total_work)
        JusticeAITask.event_handler(luigi.Event.PROGRESS)(self._handle_task_progress)

    def _update_total_work(self, task: JusticeAITask, dependency_task: JusticeAITask):
        """Register multitask total work."""
        self._account_work(task)
        self._account_work(dependency_task)

    def _account_work(self, task: JusticeAITask):
        """Account task in a total work for multitask run."""
        if task.task_id not in self._seen_tasks:
            self._seen_tasks.add(task.task_id)
            if len(self._seen_tasks) == 1:  # first task
                self.scale(task.progress_weight)
            else:
                self.scale(self.total + task.progress_weight)

    def _handle_task_progress(self, amount):
        """Handle progress reported by some task."""
        self.increase(amount)


def resolve_luigi_config_path() -> str:
    """Resolve luigi config path.

    See: https://luigi.readthedocs.io/en/stable/configuration.html#configuration
    """
    return os.environ.get("LUIGI_CONFIG_PATH", "./luigi.cfg")


LUIGI_DEFAULT_CONFIG = """
[core]
no_configure_logging=true
"""


def ensure_luigi_config(config_path: str):
    """Ensure luigi config exists."""
    if os.path.isfile(config_path):
        return
    with open(config_path, "w") as config_file:
        config_file.write(LUIGI_DEFAULT_CONFIG)


def run_luigi(*tasks: luigi.Task):
    """Run luigi tasks."""
    config_path = resolve_luigi_config_path()
    ensure_luigi_config(config_path)
    luigi.build(tasks=list(tasks), workers=1, local_scheduler=True)
