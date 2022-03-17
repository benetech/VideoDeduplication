import os


class PipelineCli:
    """Process video files."""

    def __init__(self, config):
        self._config = config

    def all(self):
        """Process all video files."""
        from winnow.utils.logging import configure_logging_cli
        from winnow.pipeline.detect_scenes import detect_scenes
        from winnow.pipeline.generate_local_matches import generate_local_matches
        from winnow.utils.files import scan_videos
        from winnow.pipeline.extract_exif import extract_exif
        from winnow.pipeline.pipeline_context import PipelineContext

        configure_logging_cli(self._config.logging)

        # Resolve list of video files from the directory
        absolute_root = os.path.abspath(self._config.sources.root)
        videos = scan_videos(absolute_root, "**", extensions=self._config.sources.extensions)

        pipeline_context = PipelineContext(self._config)
        generate_local_matches(files=videos, pipeline=pipeline_context)
        detect_scenes(files=videos, pipeline=pipeline_context)
        extract_exif(videos, pipeline=pipeline_context)
