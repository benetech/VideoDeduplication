from os.path import join, abspath

from winnow.storage.simple_repr_storage import SimpleReprStorage


class ReprStorage:
    """Persistent storage of various intermediate representations."""

    def __init__(self, directory, storage_factory=SimpleReprStorage):
        """Create new storage instance.

        Args:
            directory (String): Directory in which all representations will be stored.
        """
        self.directory = abspath(directory)
        self.frames = storage_factory(join(self.directory, "frames"))
        self.frame_level = storage_factory(join(self.directory, "frame_level"))
        self.scene_level = storage_factory(join(self.directory, "scene_level"))
        self.video_level = storage_factory(join(self.directory, "video_level"))
        self.signature = storage_factory(join(self.directory, "video_signatures"))
        self.scene_signature = storage_factory(join(self.directory, "scene_signatures"))

    def __repr__(self):
        return f"ReprStorage('{self.directory}')"

    def close(self):
        """Release any underlying resources (close database connections, etc.)."""
        self.frames.close()
        self.frame_level.close()
        self.scene_level.close()
        self.video_level.close()
        self.signature.close()
        self.scene_signature.close()
