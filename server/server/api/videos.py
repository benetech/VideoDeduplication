from http import HTTPStatus
from os.path import dirname, basename

from flask import abort, send_from_directory

from db.schema import Files
from .blueprint import api
from .helpers import get_config, resolve_video_file_path
from ..model import database


@api.route('/files/<int:file_id>/watch')
def watch_video(file_id):
    config = get_config()
    file = database.session.query(Files).filter(Files.id == file_id).first()

    # Handle file not found
    if file is None:
        abort(HTTPStatus.NOT_FOUND.value, f"File id not found: {file_id}")

    path = resolve_video_file_path(file.file_path)
    return send_from_directory(dirname(path), basename(path))
