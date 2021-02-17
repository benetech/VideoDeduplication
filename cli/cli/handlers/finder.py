from typing import Optional

from cli.handlers.errors import handle_errors
from winnow.utils.logging import configure_logging_cli


class FinderCli:
    """Detect relationships in dataset videos."""

    def __init__(self, pipeline):
        self._pipeline = pipeline

    @handle_errors
    def local_matches(self):
        """Find matches between local videos."""
        from winnow.pipeline.generate_local_matches import generate_local_matches
        from winnow.utils.files import scan_videos

        configure_logging_cli()
        config = self._pipeline.config

        videos = scan_videos(config.sources.root, "**", extensions=config.sources.extensions)
        generate_local_matches(files=videos, pipeline=self._pipeline)

    def remote_matches(self, repo: Optional[str] = None, contributor: Optional[str] = None):
        """Find matches between local files and remote fingerprints."""
        from winnow.pipeline.generate_remote_matches import generate_remote_matches

        configure_logging_cli()

        if repo is not None:
            repo = str(repo)

        if contributor is not None:
            contributor = str(contributor)

        generate_remote_matches(
            pipeline=self._pipeline,
            repository_name=repo,
            contributor_name=contributor,
        )
