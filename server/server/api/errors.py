import json
from werkzeug.exceptions import HTTPException

from .blueprint import api


@api.errorhandler(HTTPException)
def error_handler(exception):
    """JSON response for API errors"""
    response = exception.get_response()
    response.data = json.dumps({"error": exception.description, "code": exception.code})
    response.content_type = "application/json"
    return response
