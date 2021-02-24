import inspect
from typing import Dict

from server.queue.model import Request


class RequestTransformer:
    """Transform Request objects to/from dict data."""

    def __init__(self, *types):
        self._types = {}
        for request_type in types:
            if not inspect.isclass(request_type):
                raise ValueError(f"Request type is not a class: {request_type}")
            type_name = request_type.__name__
            if type_name in self._types:
                raise ValueError(f"The request type '{type_name}' is ambiguous")
            self._types[type_name] = request_type

    def fromdict(self, dict_data: Dict) -> Request:
        """Restore request type from the dict data."""
        if Request.TYPE_ATTR not in dict_data:
            raise ValueError(f"Required attribute '{Request.TYPE_ATTR}' is missing. Cannot resolve request type.")
        type_name = dict_data[Request.TYPE_ATTR]
        if type_name not in self._types:
            raise ValueError(f"Unknown request type: {type_name}")
        request_type = self._types[type_name]
        kwargs = dict_data.copy()
        del kwargs[Request.TYPE_ATTR]
        return request_type(**kwargs)

    @staticmethod
    def asdict(request: Request) -> Dict:
        """Convert Request into dict representation."""
        return request.asdict()
