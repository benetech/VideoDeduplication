import os
from http import HTTPStatus
from os.path import dirname, basename
from typing import List, Dict

import dataclasses
from dataclasses import dataclass
from flask import jsonify, request, abort, send_from_directory

import rpc.rpc_pb2 as proto
from db.access.fields import Fields
from db.access.files import (
    ListFilesRequest,
    FileMatchFilter,
    FileSort,
    FilesDAO,
    FileInclude,
    get_file_fields,
    ListFilesResults,
    FileData,
)
from db.schema import Files
from rpc.rpc_pb2 import FoundVideo
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
    semantic_search,
)
from ..model import database, Transform

# Optional file fields to be loaded
FILE_FIELDS = Fields(Files.exif, Files.meta, Files.signature, Files.scenes)


@dataclass
class ListFilesApiRequest(ListFilesRequest):
    """Augmented List-Files request."""

    semantic_query: str = None
    min_semantic_similarity: float = 0.05
    max_semantic_search_hits: int = 10000


def parse_params() -> ListFilesApiRequest:
    """Parse and validate request arguments."""
    config = get_config()
    result = ListFilesApiRequest()
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
    result.sort = parse_enum(request.args, "sort", enum_class=FileSort, default=FileSort.RELEVANCE)
    result.remote = parse_boolean(request.args, "remote")
    result.contributor = request.args.get("contributor", None, type=str)
    result.repository = request.args.get("repository", None, type=str)
    result.templates = parse_int_list(request.args, "templates")
    result.contributors = parse_int_list(request.args, "contributors")
    result.semantic_query = request.args.get("semantic_query", None, type=str)
    result.min_semantic_similarity = request.args.get(
        "min_semantic_similarity", result.min_semantic_similarity, type=float
    )
    result.max_semantic_search_hits = parse_positive_int(
        request.args, "max_semantic_search_hits", result.max_semantic_search_hits
    )
    return result


def sort_by_relevance(result_ids: ListFilesResults, semantic_results: List[FoundVideo]) -> List[int]:
    """Sort semantic search ids by relevance."""
    scores = {video.id: video.score for video in semantic_results}
    sorted_ids = [(scores[item.file[0]], item.file[0]) for item in result_ids.items]
    sorted_ids.sort(reverse=True)
    return [file_id for (score, file_id) in sorted_ids]


def id_score(scores: Dict[int, int]):
    """Create score getter by id."""

    def get_score(data: FileData):
        return scores[data.file[0]]

    return get_score


def file_score(scores: Dict[int, int]):
    """Create score getter by file."""

    def get_score(data: FileData):
        return scores[data.file.id]

    return get_score


def handle_semantic_query(req: ListFilesApiRequest) -> ListFilesResults:
    """Handle request with semantic video query."""
    with semantic_search() as service:
        response = service.query_videos(
            proto.TextSearchRequest(
                query=req.semantic_query,
                min_similarity=req.min_semantic_similarity,
                max_count=req.max_semantic_search_hits,
            )
        )
    selected_ids = [file.id for file in response.videos]
    no_limits_req = dataclasses.replace(req, limit=None, offset=None, include=())
    no_limits_res = FilesDAO.list_files(no_limits_req, database.session, entity=Files.id, selected_ids=selected_ids)
    scores = None
    if req.sort == FileSort.RELEVANCE:
        # Sort results by relevance if needed
        scores = {video.id: video.score for video in response.videos}
        no_limits_res.items.sort(key=id_score(scores), reverse=True)
    result_ids = [item.file[0] for item in no_limits_res.items]

    limit, offset = req.limit, req.offset
    page_ids = result_ids[offset : offset + limit]
    load_page_req = ListFilesRequest(include=req.include, sort=req.sort)
    result_files = FilesDAO.list_files(load_page_req, database.session, selected_ids=page_ids)
    if scores is not None:
        result_files.items.sort(key=file_score(scores), reverse=True)
    result_files.counts = no_limits_res.counts
    return result_files


@api.route("/files/", methods=["GET"])
def list_files():
    req = parse_params()

    if req.semantic_query:
        results = handle_semantic_query(req)
    else:
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
