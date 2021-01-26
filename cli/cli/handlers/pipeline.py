import os


class PipelineCli:
    """Process video files."""

    def __init__(self, config):
        self._config = config

    def all(self):
        """Process all video files."""
        from winnow.pipeline.extract_exif import extract_exif
        from winnow.pipeline.extract_features import extract_features
        from winnow.pipeline.generate_matches import generate_matches
        from winnow.utils.files import scan_videos
        from winnow.utils.logging import configure_logging_cli

        logger = configure_logging_cli()

        # Resolve list of video files from the directory
        absolute_root = os.path.abspath(self._config.sources.root)
        videos = scan_videos(absolute_root, "**", extensions=self._config.sources.extensions)

        logger.info("Starting extract-features step...")
        extract_features(self._config, videos)

        logger.info("Starting generate-matches step...")
        generate_matches(self._config)

        logger.info("Starting extract-exif step...")
        extract_exif(self._config)
