from dataclasses import dataclass


@dataclass(frozen=True)
class ReprKey:
    """Intermediate representation storage key.

    The purpose of the file hash is to guarantee that whenever original
    file content changes the client must be able to detect that to update
    the stored representation value.

    Configuration tag purpose is to guarantee that whenever pipeline
    configuration is changed the clint code must be able to detect that
    to update the stored representation value.
    """
    path: str  # video file path relative to dataset root folder
    hash: str  # video file hash
    tag: str = None  # pipeline configuration tag
