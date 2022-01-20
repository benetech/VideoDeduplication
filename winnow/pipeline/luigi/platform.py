import logging
import logging.config

import luigi.setup_logging
from cached_property import cached_property
from dataclasses import dataclass

from winnow.config import Config
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.storage.file_key import FileKey
from winnow.utils.cli import create_pipeline


class WithLogger:
    """Class with logger."""

    @cached_property
    def logger(self) -> logging.Logger:
        """Get current task logger."""
        cls = self.__class__
        return logging.getLogger(f"task.{cls.__qualname__}")


class PipelineTask(luigi.Task, WithLogger):
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
