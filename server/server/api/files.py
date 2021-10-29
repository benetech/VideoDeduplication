import os
from http import HTTPStatus
from os.path import dirname, basename

from flask import jsonify, request, abort, send_from_directory

from db.access.fields import Fields
from db.access.files import ListFilesRequest, FileMatchFilter, FileSort, FilesDAO, FileInclude, get_file_fields
from db.schema import Files
from thumbnail.ffmpeg import extract_frame_tmp
from .blueprint import api
from .helpers import (
    parse_boolean,
    parse_positive_int,
    parse_date,
    parse_enum,
    get_thumbnails,
    resolve_video_file_path,
    parse_seq,
    get_config,
    parse_int_list,
    parse_enum_seq,
)
from ..model import database, Transform

# Optional file fields to be loaded
FILE_FIELDS = Fields(Files.exif, Files.meta, Files.signature, Files.scenes)


def parse_params() -> ListFilesRequest:
    """Parse and validate request arguments."""
    config = get_config()
    result = ListFilesRequest()
    result.limit = parse_positive_int(request.args, "limit", 20)
    result.offset = parse_positive_int(request.args, "offset", 0)
    result.path_query = request.args.get("path", "", type=str).strip()
    result.audio = parse_boolean(request.args, "audio")
    result.min_length = parse_positive_int(request.args, "min_length")
    result.max_length = parse_positive_int(request.args, "max_length")
    result.include = parse_enum_seq(request.args, "include", enum_class=FileInclude, default=())
    result.extensions = parse_seq(request.args, "extensions")
    result.date_from = parse_date(request.args, "date_from")
    result.date_to = parse_date(request.args, "date_to")
    result.match_filter = parse_enum(request.args, "matches", enum_class=FileMatchFilter, default=FileMatchFilter.ALL)
    result.related_distance = config.related_distance
    result.duplicate_distance = config.duplicate_distance
    result.sort = parse_enum(request.args, "sort", enum_class=FileSort, default=None)
    result.remote = parse_boolean(request.args, "remote")
    result.contributor = request.args.get("contributor", None, type=str)
    result.repository = request.args.get("repository", None, type=str)
    result.templates = parse_int_list(request.args, "templates")
    return result


@api.route("/files/", methods=["GET"])
def list_files():
    req = parse_params()

    results = FilesDAO.list_files(req, database.session)
    include_flags = {field.value: True for field in req.include}

    return jsonify(
        {
            "items": [Transform.file_data(item, **include_flags) for item in results.items],
            "offset": req.offset,
            "total": results.counts.total,
            "duplicates": results.counts.duplicates,
            "related": results.counts.related,
            "unique": results.counts.unique,
        }
    )


@api.route("/files/<int:file_id>", methods=["GET"])
def get_file(file_id):
    extra_fields = get_file_fields(parse_enum_seq(request.args, "include", enum_class=FileInclude, default=()))

    # Fetch file from database
    query = database.session.query(Files)
    query = Fields.preload(query, extra_fields)
    file = query.get(file_id)

    # Handle file not found
    if file is None:
        abort(HTTPStatus.NOT_FOUND.value, f"File id not found: {file_id}")

    include_flags = {field.key: True for field in extra_fields}
    data = Transform.file(file, **include_flags)
    data["related_count"] = FilesDAO.file_matches(file_id, database.session).count()
    return jsonify(data)


@api.route("/files/<int:file_id>/thumbnail", methods=["GET"])
def get_thumbnail(file_id):
    # Get time position
    time = parse_positive_int(request.args, "time", default=0)
    width = parse_positive_int(request.args, "width", default=320)

    # Fetch file from database
    query = database.session.query(Files)
    file = query.filter(Files.id == file_id).first()

    # Handle file not found
    if file is None:
        abort(HTTPStatus.NOT_FOUND.value, f"File not found: {file_id}")

    # Handle remote files
    if not file.file_path:
        abort(HTTPStatus.NOT_FOUND.value, f"Remote file cannot have thumbnails: {file_id}")

    thumbnails_cache = get_thumbnails()
    thumbnail = thumbnails_cache.get(file.file_path, file.sha256, position=time)
    if thumbnail is None:
        video_path = resolve_video_file_path(file.file_path)
        if not os.path.isfile(video_path):
            abort(HTTPStatus.NOT_FOUND.value, f"Video file is missing: {file.file_path}")
        thumbnail = extract_frame_tmp(video_path, position=time, width=width)
        if thumbnail is None:
            abort(HTTPStatus.NOT_FOUND.value, f"Timestamp exceeds video length: {time}")
        thumbnail = thumbnails_cache.move(file.file_path, file.sha256, position=time, thumbnail=thumbnail)

    return send_from_directory(dirname(thumbnail), basename(thumbnail))
