from typing import Iterable, Sequence, Dict

from winnow.duplicate_detection.neighbors import FeatureVector
from winnow.storage.file_key import FileKey


def as_vectors(data: Dict[FileKey, Sequence[float]]) -> Iterable[FeatureVector]:
    """Convert dictionary of signatures to feature-vectors."""
    return (FeatureVector(key=key, features=value) for key, value in data.items())
