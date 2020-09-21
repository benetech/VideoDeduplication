from os.path import join, abspath

from .path_repr_storage import PathReprStorage


class ReprStorage:
    """Persistent storage of various intermediate representations."""

    def __init__(self, directory, storage_factory=PathReprStorage):
        """Create new storage instance.

        Args:
            directory (String): Directory in which all representations will be stored.
        """
        self.directory = abspath(directory)
        self.frame_level = storage_factory(join(self.directory, "frame_level"))
        self.video_level = storage_factory(join(self.directory, "video_level"))
        self.signature = storage_factory(join(self.directory, "video_signatures"))
