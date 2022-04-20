import os.path
import tempfile
from typing import Sequence, Tuple

import luigi
from cached_property import cached_property

from winnow.collection.file_collection import FileCollection
from winnow.pipeline.luigi.exif import extract_exif, save_exif_database
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.utils.download import download_path, download_videos


class DownloadTarget(luigi.Target):
    """Download results."""

    def __init__(self, urls: Sequence[str], destination_template: str, coll: FileCollection):
        self.urls: Sequence[str] = urls
        self.destination_template: str = destination_template
        self.coll: FileCollection = coll

    def exists(self) -> bool:
        return not self.remaining_urls

    @cached_property
    def coll_paths(self) -> Sequence[str]:
        """File collection path of the target files."""
        coll_paths = []
        fake_output = "/output/"
        for url in self.urls:
            path = download_path(
                video_url=url,
                output_template=self.destination_template,
                output_directory=fake_output,
            )
            coll_paths.append(os.path.relpath(path, start=fake_output))
        return coll_paths

    @cached_property
    def remaining(self) -> Tuple[Sequence[str], Sequence[str]]:
        """Get remaining urls and collection paths."""
        remaining_urls = []
        remaining_coll_paths = []
        for url, coll_path in zip(self.urls, self.coll_paths):
            if not self.coll.exists(coll_path):
                remaining_urls.append(url)
                remaining_coll_paths.append(coll_path)
        return tuple(remaining_urls), tuple(remaining_coll_paths)

    @cached_property
    def remaining_urls(self) -> Sequence[str]:
        """Get URLs that will be downloaded."""
        remaining_urls, _ = self.remaining
        return remaining_urls

    @cached_property
    def remaining_coll_paths(self) -> Sequence[str]:
        """Get collection paths that will be added."""
        _, remaining_paths = self.remaining
        return remaining_paths


class DownloadFilesTask(PipelineTask):
    """Download and process files from the web."""

    urls: Sequence[str] = luigi.ListParameter()
    destination_template: str = luigi.Parameter(default="%(title)s.%(ext)s")
    override_existing: bool = luigi.BoolParameter(default=True, significant=False)

    def run(self):
        target = self.output()
        coll = self.pipeline.coll

        remaining_urls = target.remaining_urls
        remaining_coll_paths = target.remaining_coll_paths
        self.logger.info("%s of %s URLs will be downloaded", len(remaining_urls), len(self.urls))

        self.logger.info("Downloading...")
        with tempfile.TemporaryDirectory("download-urls") as download_dir:
            download_paths = download_videos(
                urls=remaining_urls,
                output_template=self.destination_template,
                root_directory=download_dir,
                progress=self.progress.subtask(0.9),
                logger=self.logger,
            )
            self.logger.info("Downloaded %s files", len(download_paths))

            self.logger.info("Storing files to the user file collection")
            for file_path, coll_path in zip(download_paths, remaining_coll_paths):
                coll.store(file_path, coll_path, exist_ok=self.override_existing)
            self.logger.info("Successfully stored %s files to user file collection", len(download_paths))

        if self.config.database.use:
            self.logger.info("Extracting exif.")
            extracting_exif = self.progress.remaining()
            file_keys = [coll.file_key(path) for path in remaining_coll_paths]
            exif_df = extract_exif(
                file_keys=file_keys,
                pipeline=self.pipeline,
                progress=extracting_exif.subtask(0.7),
                logger=self.logger,
            )
            self.logger.info("Saving EXIF to database")
            save_exif_database(file_keys=file_keys, exif_df=exif_df, pipeline=self.pipeline)
            extracting_exif.complete()

    def output(self):
        return DownloadTarget(
            urls=self.urls,
            destination_template=self.destination_template,
            coll=self.pipeline.coll,
        )
