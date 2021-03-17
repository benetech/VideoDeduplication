import numpy as np
from dataclasses import dataclass


@dataclass
class Template:
    """Template representation."""

    name: str
    features: np.ndarray  # Features that will be searched for in video files
