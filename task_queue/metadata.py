from dataclasses import dataclass, asdict
from typing import Optional


@dataclass
class TaskRuntimeMetadata:
    """Running task metadata."""

    # Task progress from [0.0, 1.0]
    progress: Optional[float] = None

    def asdict(self):
        """Convert task metadata to a serializable dictionary."""
        return asdict(self)

    @staticmethod
    def fromdict(data):
        """Restore metadata from a serializable dictionary."""
        return TaskRuntimeMetadata(**data)
