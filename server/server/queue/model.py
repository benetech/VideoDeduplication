from datetime import datetime
from enum import Enum
from numbers import Number
from typing import List, Optional, Dict, Union

from dataclasses import dataclass, asdict

from server import time_utils

# Type hint for json-serializable data.
JsonData = Union[List, Dict, Number, bool, str]


@dataclass
class Request:
    """Base class for task request details."""

    # Dict attribute in which the request type is encoded
    TYPE_ATTR = "type"

    def kwargs(self):
        """Get key-work arguments to invoke task."""
        return asdict(self)

    def asdict(self) -> Dict:
        """Convert request to serializable dict data."""
        result = self.kwargs().copy()
        result[self.TYPE_ATTR] = type(self).__name__
        return result


@dataclass
class TaskError:
    exc_type: str
    exc_message: str
    exc_module: str
    traceback: str


class TaskStatus(Enum):
    """Enum for task status."""

    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"
    REVOKED = "REVOKED"


@dataclass
class Task:
    """Basic class for all tasks."""

    id: str
    created: datetime
    status_updated: datetime
    status: TaskStatus
    request: Request
    error: Optional[TaskError] = None
    progress: Optional[float] = None
    result: Optional[JsonData] = None

    def asdict(self):
        data = asdict(self)
        data["created"] = time_utils.dumps(self.created)
        data["status_updated"] = time_utils.dumps(self.status_updated)
        data["status"] = self.status.value
        data["request"] = self.request.asdict()
        return data


@dataclass
class ProcessDirectory(Request):
    """Process entire directory."""

    directory: str
    frame_sampling: Optional[int] = None
    save_frames: Optional[bool] = None
    filter_dark: Optional[bool] = None
    dark_threshold: Optional[Number] = None
    extensions: Optional[List[str]] = None
    match_distance: Optional[float] = None
    min_duration: Optional[Number] = None


@dataclass
class ProcessFileList(Request):
    """Process all files from the given list."""

    files: List[str]
    frame_sampling: Optional[int] = None
    save_frames: Optional[bool] = None
    filter_dark: Optional[bool] = None
    dark_threshold: Optional[Number] = None
    extensions: Optional[List[str]] = None
    match_distance: Optional[float] = None
    min_duration: Optional[Number] = None


@dataclass
class MatchTemplates(Request):
    """Match all templates for all existing files."""

    template_distance: Optional[float] = None
    template_distance_min: Optional[float] = None
    frame_sampling: Optional[int] = None
    save_frames: Optional[bool] = None
    filter_dark: Optional[bool] = None
    dark_threshold: Optional[Number] = None
    extensions: Optional[List[str]] = None
    match_distance: Optional[float] = None
    min_duration: Optional[Number] = None


@dataclass
class FindFrame(Request):
    """Find frame matches in the given directory."""

    file_id: int
    frame_time_millis: int
    directory: str = "."
    template_distance: Optional[float] = None
    template_distance_min: Optional[float] = None
    frame_sampling: Optional[int] = None
    save_frames: Optional[bool] = None
    filter_dark: Optional[bool] = None
    dark_threshold: Optional[Number] = None
    extensions: Optional[List[str]] = None
    match_distance: Optional[float] = None
    min_duration: Optional[Number] = None


@dataclass
class ProcessOnlineVideo(Request):
    """Process entire directory."""

    urls: List[str]
    destination_template: str = "%(title)s.%(ext)s"
    frame_sampling: Optional[int] = None
    save_frames: Optional[bool] = None
    filter_dark: Optional[bool] = None
    dark_threshold: Optional[Number] = None
    extensions: Optional[List[str]] = None
    match_distance: Optional[float] = None
    min_duration: Optional[Number] = None


@dataclass
class PushFingerprints(Request):
    """Push fingerprints to remote repository."""

    repository_id: int


@dataclass
class PullFingerprints(Request):
    """Pull fingerprints from remote repository."""

    repository_id: int


@dataclass
class MatchRemoteFingerprints(Request):
    """Match local and remote fingerprints."""

    repository_id: Optional[int] = None
    contributor_name: Optional[str] = None


@dataclass
class PrepareSemanticSearch(Request):
    """Generate indexes required for semantic search."""

    force: bool = True


@dataclass
class GenerateTiles(Request):
    """Generate interactive map tiles with embeddings."""

    algorithm: str
    max_zoom: int = 8
    force: bool = False


@dataclass
class TestTask(Request):
    """Example Fibonacci task for testing purpose."""

    n: int
    delay: int
