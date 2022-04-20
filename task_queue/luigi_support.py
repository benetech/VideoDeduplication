import logging
import os
from contextlib import contextmanager

import luigi

from task_queue.metadata import TaskRuntimeMetadata
from task_queue.winnow_task import WinnowTask
from winnow.pipeline.luigi.platform import JusticeAITask
from winnow.pipeline.progress_monitor import ProgressMonitor


class ProgressObserver:
    def __init__(self, celery_task: WinnowTask, resolution: float = 0.001):
        self.celery_task: WinnowTask = celery_task
        self.resolution: float = resolution
        self.last_update: float = -resolution

    def __call__(self, progress: float, change: float):
        if progress - self.last_update >= self.resolution:
            self.celery_task.update_metadata(TaskRuntimeMetadata(progress=progress))
            self.last_update = progress


class LuigiRootProgressMonitor(ProgressMonitor):
    """Root progress monitor to track progress made by entire multitask run."""

    def __init__(self, celery_task: WinnowTask):
        super().__init__(ProgressObserver(celery_task))
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


@contextmanager
def luigi_config(
    celery_task,
    frame_sampling=None,
    save_frames=None,
    filter_dark=None,
    dark_threshold=None,
    extensions=None,
    match_distance=None,
    min_duration=None,
    template_distance=None,
    template_distance_min=None,
    **_,
):
    """Convenience context-manager to prepare and tear-down luigi run."""
    from winnow.utils.config import resolve_config
    from celery.utils.log import get_task_logger

    # Initialize a progress monitor
    progress = LuigiRootProgressMonitor(celery_task=celery_task)

    # Load configuration file
    logger: logging.Logger = get_task_logger("task_queue.tasks")
    logger.info("Loading config file")
    config = resolve_config(
        frame_sampling=frame_sampling,
        save_frames=save_frames,
        filter_dark=filter_dark,
        dark_threshold=dark_threshold,
        extensions=extensions,
        match_distance=match_distance,
        min_duration=min_duration,
        templates_distance=template_distance,
        templates_distance_min=template_distance_min,
    )
    config.database.use = True
    logger.info("Loaded config: %s", config)

    luigi_error = None

    @JusticeAITask.event_handler(luigi.Event.FAILURE)
    def handle_error(task, exception):
        """Handle errors originated from the luigi pipeline."""
        nonlocal luigi_error
        logger.error("Error occurred while executing luigi tasks: %s, %s", task, exception)
        luigi_error = exception

    yield config

    if luigi_error is not None:
        raise luigi_error
    progress.complete()


@contextmanager
def luigi_pipeline(celery_task, **config_overrides):
    """Convenience context-manager to set up a luigi run when a pipeline is required."""
    from winnow.pipeline.pipeline_context import PipelineContext

    with luigi_config(celery_task, **config_overrides) as config:
        yield PipelineContext(config)


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
