class PipelineCli:
    """Process video files."""

    def __init__(self, config):
        self._config = config

    def all(self):
        """Process all video files."""

        import luigi

        from winnow.pipeline.luigi.exif import ExifTask
        from winnow.pipeline.luigi.signatures import (
            SignaturesTask,
            DBSignaturesTask,
        )
        from winnow.pipeline.luigi.matches import MatchesReportTask, DBMatchesTask

        luigi.build(
            [
                ExifTask(config=self._config),
                SignaturesTask(config=self._config),
                DBSignaturesTask(config=self._config),
                MatchesReportTask(config=self._config),
                DBMatchesTask(config=self._config),
            ],
            local_scheduler=True,
            workers=1,
        )
