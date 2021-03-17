from typing import List

from dataclasses import dataclass


@dataclass
class Template:
    """Template representation."""

    name: str
    features: List[List[float]]  # Features that will be searched for in video files
