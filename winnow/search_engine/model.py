from typing import List

import numpy as np
from dataclasses import dataclass, field

from template_support.file_storage import FileStorage


@dataclass
class TemplateExample:
    """Template example descriptor."""

    storage_key: str  # File storage key
    features: np.ndarray  # Features of the given example
    file_storage: FileStorage = None  # Associated file storage

    def get_file(self, destination_path: str) -> bool:
        """Save example file to the file system location."""
        if self.file_storage is None:
            return False
        return self.file_storage.get_file(self.storage_key, destination_path)


@dataclass
class Template:
    """Template representation.

    Template is some recognizable object that could appear in video files.
    Template is specified by a collection of examples where each example
    is an image of the desired object.
    """

    name: str
    features: np.ndarray  # Features that will be searched for in video files
    examples: List[TemplateExample] = field(default_factory=list)  # Example images


@dataclass
class Frame:
    """Video file frame."""

    path: str  # Video file path
    time: float  # Offset in milliseconds
