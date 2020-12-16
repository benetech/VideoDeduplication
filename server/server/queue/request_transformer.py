import inspect


class RequestTransformer:
    REQUEST_TYPE_ATTR = "type"

    def __init__(self, *types):
        self._types = {}
        for request_type in types:
            if not inspect.isclass(request_type):
                raise ValueError(f"Request type is not a class: {request_type}")
            type_name = RequestTransformer._request_type_name(request_type)
            if type_name in self._types:
                raise ValueError(f"The request type '{type_name}' is ambiguous")
            self._types[type_name] = request_type

    def fromdict(self, dict_data):
        if self.REQUEST_TYPE_ATTR not in dict_data:
            raise ValueError(f"Required attribute '{self.REQUEST_TYPE_ATTR}' is missing. Cannot resolve request type.")
        type_name = dict_data[self.REQUEST_TYPE_ATTR]
        if type_name not in self._types:
            raise ValueError(f"Unknown request type: {type_name}")
        request_type = self._types[type_name]
        kwargs = dict_data.copy()
        del kwargs[self.REQUEST_TYPE_ATTR]
        return request_type(**kwargs)

    @staticmethod
    def asdict(request):
        result = request.kwargs().copy()
        result[RequestTransformer.REQUEST_TYPE_ATTR] = RequestTransformer._request_type_name(request)
        return result

    @staticmethod
    def _request_type_name(request):
        if inspect.isclass(request):
            return request.__name__
        return type(request).__name__
