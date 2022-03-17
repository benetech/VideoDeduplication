import os
from http import HTTPStatus
from os.path import dirname, basename
from typing import List

import dataclasses
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
    get_cache,
)
from ..cache import FileQueryResults
from ..model import database, Transform, ListFilesApiRequest

# Optional file fields to be loaded
FILE_FIELDS = Fields(Files.exif, Files.meta, Files.signature, Files.scenes)


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


class SemanticRequest:
    def __init__(self, req: ListFilesApiRequest):
        self.req: ListFilesApiRequest = req

    @staticmethod
    def _sort_by_scores(results: FileQueryResults, semantic_results: List[FoundVideo]):
        """Sort query results by scores."""
        scores = {video.id: video.score for video in semantic_results}
        results.file_ids.sort(key=scores.get, reverse=True)
        return results

    def _do_semantic_query(self) -> FileQueryResults:
        """Do calculate overall file-ids list and file counts."""
        req = self.req

        # Perform semantic search
        with semantic_search() as semantic_search_svc:
            semantic_search_results = semantic_search_svc.query_videos(
                proto.TextSearchRequest(
                    query=req.semantic_query,
                    min_similarity=req.min_semantic_similarity,
                    max_count=req.max_semantic_search_hits,
                )
            )

        # Filter file ids from semantic search results based on database filters
        semantic_ids = [file.id for file in semantic_search_results.videos]
        db_request = dataclasses.replace(req, limit=None, offset=None, include=())
        db_response = FilesDAO.list_files(db_request, database.session, entity=Files.id, selected_ids=semantic_ids)
        all_ids = [item.file[0] for item in db_response.items]

        # Prepare FileQueryResults and sort by relevance if needed
        query_results = FileQueryResults(file_ids=all_ids, counts=db_response.counts)
        if req.sort == FileSort.RELEVANCE:
            self._sort_by_scores(query_results, semantic_search_results.videos)

        return query_results

    def _get_slice(self) -> FileQueryResults:
        """Get slice of the requested file ids."""
        req = self.req
        cache = get_cache()
        if req in cache:
            return cache.slice(req)
        results = self._do_semantic_query()
        cache[req] = results
        results.file_ids = results.file_ids[req.offset : req.offset + req.limit]
        return results

    @staticmethod
    def _restore_order(page: FileQueryResults, db_results: ListFilesResults) -> ListFilesResults:
        """Restore order using file ids from the given page."""
        index = {item.file.id: item for item in db_results.items}
        sorted_items = []
        for file_id in page.file_ids:
            sorted_items.append(index[file_id])
        db_results.items = sorted_items
        return db_results

    def execute(self) -> ListFilesResults:
        """Execute semantic request."""
        # Get file ids and counts corresponding to requested page
        page = self._get_slice()

        # Load attributes from database by file ids
        db_request = ListFilesRequest(include=self.req.include, sort=self.req.sort)
        db_results = FilesDAO.list_files(db_request, database.session, selected_ids=page.file_ids)

        # Restore item order and correct counts
        self._restore_order(page, db_results)
        db_results.counts = page.counts
        return db_results


@api.route("/files/", methods=["GET"])
def list_files():
    req = parse_params()

    if req.semantic_query:
        results = SemanticRequest(req).execute()
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
