import luigi

from winnow.pipeline.luigi.exif import ExifTask
from winnow.pipeline.luigi.matches import DBMatchesTask
from winnow.pipeline.luigi.platform import PipelineTask


class ProcessFilesTask(PipelineTask):
    """Execute the basic file processing: extract exif, extract fingerprints, detect matches."""

    prefix: str = luigi.Parameter(default=".")

    def requires(self):
        yield DBMatchesTask(config=self.config, prefix=self.prefix)
        yield ExifTask(config=self.config, prefix=self.prefix)
