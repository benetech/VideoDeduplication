import os

from winnow.pipeline.detect_scenes import detect_scenes
from winnow.pipeline.pipeline_context import PipelineContext


class PipelineCli:
    """Process video files."""

    def __init__(self, config):
        self._config = config

    def all(self):
        """Process all video files."""
        from winnow.pipeline.generate_local_matches import generate_local_matches
        from winnow.utils.files import scan_videos

        # Resolve list of video files from the directory
        absolute_root = os.path.abspath(self._config.sources.root)
        videos = scan_videos(absolute_root, "**", extensions=self._config.sources.extensions)

        pipeline_context = PipelineContext(self._config)
        generate_local_matches(files=videos, pipeline=pipeline_context)
        detect_scenes(files=videos, pipeline=pipeline_context)
