from flask import Blueprint

api = Blueprint('api', __name__)

from . import signatures,videometadata,scenes,matches