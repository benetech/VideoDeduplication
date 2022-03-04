import logging
import os
import shutil
from glob import glob

import luigi

from winnow.pipeline.luigi.platform import JusticeAITask
from winnow.pipeline.progress_monitor import ProgressMonitor, LazyProgress, BaseProgressMonitor


class NormalizeStorageTask(JusticeAITask):
    """Normalize fingerprint directory."""

    fingerprints_directory: str = luigi.Parameter()
    search_suffix: str = luigi.Parameter(default=".npy")
    expected_suffix: str = luigi.Parameter(default="_vgg_features.npy")

    def run(self):
        normalize_fingerprint_storage(
            fingerprints_directory=self.fingerprints_directory,
            search_suffix=self.search_suffix,
            expected_suffix=self.expected_suffix,
            logger=self.logger,
            progress=self.progress,
        )


def normalize_fingerprint_storage(
    fingerprints_directory: str,
    search_suffix: str = ".npy",
    expected_suffix: str = "_vgg_features.npy",
    logger: logging.Logger = None,
    progress: BaseProgressMonitor = ProgressMonitor.NULL,
):
    """Normalize fingerprint storage format."""

    logger = logger or logging.getLogger(__name__)
    logger.info("Normalizing signature storage in %s", fingerprints_directory)

    search_pattern = os.path.join(fingerprints_directory, f"**/*{search_suffix}")
    sig_files = list(filter(os.path.isfile, glob(search_pattern, recursive=True)))
    logger.info("Found %s candidate files", len(sig_files))

    changed = 0
    progress = LazyProgress(progress.scale(len(sig_files), unit="files"))
    for file_path in sig_files:
        if not file_path.endswith(expected_suffix):
            new_path = file_path[: -len(search_suffix)] + expected_suffix
            shutil.move(file_path, new_path)
            changed += 1
        progress.increase(1)
    progress.complete()
    logger.info("Normalized %s files", changed)
