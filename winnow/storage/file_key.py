from os import PathLike

from dataclasses import dataclass


@dataclass(frozen=True)
class FileKey(PathLike):
    """Intermediate representation storage key.

    The purpose of the file hash is to guarantee that whenever original
    file content changes the client must be able to detect that to update
    the stored representation value.
    """

    path: str  # video file path relative to dataset root folder
    hash: str  # video file hash

    def __fspath__(self):
        """Treat file-key as a file-system path relative to the dataset root folder."""
        return self.path
