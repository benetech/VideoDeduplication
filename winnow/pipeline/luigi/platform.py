import logging
import logging.config
from typing import Callable, Any

import luigi.setup_logging
from cached_property import cached_property
from dataclasses import dataclass

from winnow.config import Config
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor
from winnow.storage.file_key import FileKey
from winnow.utils.cli import create_pipeline


class WithLogger:
    """Class with logger."""

    @cached_property
    def logger(self) -> logging.Logger:
        """Get current task logger."""
        cls = self.__class__
        return logging.getLogger(f"task.{cls.__qualname__}")


class JusticeAITask(luigi.Task, WithLogger):
    """Basic task class for all JusticeAI tasks."""

    progress_weight = 1.0  # Amount of work (time complexity) relative to other tasks

    @cached_property
    def progress_observer(self) -> Callable[[float, float], Any]:
        """Get progress observer for the current task to pipe ProgressMonitor
        notifications to the Luigi's messaging infrastructure.
        """

        def observer(_, change):
            """Progress observer that sends Luigi messages honoring current task progress weight."""
            self.trigger_event(luigi.Event.PROGRESS, self.progress_weight * change)

        return observer

    @cached_property
    def progress(self) -> BaseProgressMonitor:
        """Get the progress monitor associated with the current task."""
        return ProgressMonitor(observer=self.progress_observer)

    def on_success(self):
        """Make sure progress is completed upon the task completion."""
        self.progress.complete()


class PipelineTask(JusticeAITask):
    """Base class for pipeline tasks."""

    config_path = luigi.Parameter()

    @cached_property
    def pipeline(self) -> PipelineContext:
        """Get current pipeline."""
        return create_pipeline(self.config_path)

    @cached_property
    def config(self) -> Config:
        """Get resolved config."""
        return self.pipeline.config

    @cached_property
    def output_directory(self) -> str:
        """Directory to store processing results."""
        return self.config.repr.directory


@dataclass
class Match:
    """Data model for detected file match."""

    source: FileKey
    target: FileKey
    distance: float
