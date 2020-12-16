from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
from typing import List

from server.queue.request_transformer import RequestTransformer


@dataclass
class Request:
    def kwargs(self):
        return asdict(self)


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

    def asdict(self):
        data = asdict(self)
        data["status"] = self.status.value
        data["request"] = RequestTransformer.asdict(self.request)
        return data


@dataclass
class ProcessDirectory(Request):
    """Process entire directory."""

    directory: str


@dataclass
class ProcessFileList(Request):
    """Process all files from the given list."""

    files: List[str]
