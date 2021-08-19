from flask import jsonify

from sqlalchemy import func
from db.schema import Exif
from .blueprint import api
from ..model import database


@api.route("/stats/extensions", methods=["GET"])
def list_file_extensions():
    """List file extensions."""
    records = (
        database.session.query(func.lower(Exif.General_FileExtension))
        .filter(Exif.General_FileExtension != None)  # noqa: E711
        .distinct()
    )
    extensions = [record[0] for record in records if record[0]]
    return jsonify({"extensions": extensions})
