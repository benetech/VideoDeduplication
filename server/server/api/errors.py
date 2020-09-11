from werkzeug.exceptions import HTTPException

from .blueprint import api


@api.errorhandler(HTTPException)
def error_handler(exception):
    """Empty response for API errors"""
    response = exception.get_response()
    response.data = ""
    return response
