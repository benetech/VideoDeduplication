from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Optional

from server import time_utils
from server.queue.model import Request
from server.queue.request_transformer import RequestTransformer


@dataclass
class TaskMetadata:
    id: str
    created: datetime
    request: Request
    progress: Optional[float] = None

    def asdict(self):
        result = asdict(self)
        result["created"] = time_utils.dumps(self.created)
        result["request"] = RequestTransformer.asdict(self.request)
        return result

    @staticmethod
    def fromdict(data, request_transformer: RequestTransformer):
        data = data.copy()
        data["created"] = time_utils.loads(data["created"])
        data["request"] = request_transformer.fromdict(data["request"])
        return TaskMetadata(**data)
