from typing import Optional

from cli.handlers.errors import handle_errors


class FinderCli:
    """Detect relationships in dataset videos."""

    def __init__(self, pipeline):
        self._pipeline = pipeline

    @handle_errors
    def local_matches(self):
        """Find matches between local videos."""
        import luigi

        from winnow.pipeline.luigi.matches import MatchesReportTask

        luigi.build([MatchesReportTask(config=self._pipeline.config)], local_scheduler=True, workers=1)

    def remote_matches(self, repo: Optional[str] = None):
        """Find matches between local files and remote fingerprints."""
        import logging.config
        import luigi

        from winnow.pipeline.luigi.matches import RemoteMatchesTask

        logging.config.fileConfig("./logging.conf")
        luigi.build(
            [RemoteMatchesTask(config=self._pipeline.config, repository_name=repo)],
            local_scheduler=True,
            workers=1,
        )
