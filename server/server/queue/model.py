from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
from typing import List, Optional

from server.queue.request_transformer import RequestTransformer


@dataclass
class Request:
    def kwargs(self):
        return asdict(self)


@dataclass
class TaskError:
    exc_type: str
    exc_message: str
    exc_module: str
    traceback: str


class TaskStatus(Enum):
    """Enum for """

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

    def asdict(self):
        data = asdict(self)
        data["status"] = self.status.value
        data["request"] = RequestTransformer.asdict(self.request)
        return data


@dataclass
class ProcessDirectory(Request):
    """Process entire directory."""

    directory: str
    frame_sampling: Optional[int] = None
    save_frames: Optional[bool] = None


@dataclass
class ProcessFileList(Request):
    """Process all files from the given list."""

    files: List[str]
    frame_sampling: Optional[int] = None
    save_frames: Optional[bool] = None


@dataclass
class TestTask(Request):
    """Example Fibonacci task for testing purpose."""

    n: int
    delay: int
