from flask import jsonify

from db.schema import Exif
from .blueprint import api
from ..model import database


@api.route("/stats/extensions", methods=["GET"])
def list_file_extensions():
    """List file extensions."""
    records = database.session.query(Exif.General_FileExtension).distinct()
    extensions = [record[0] for record in records]
    return jsonify({"extensions": extensions})
