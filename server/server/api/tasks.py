import os
from http import HTTPStatus

from flask import jsonify, request, abort, send_from_directory, Response

from server.queue.instance import task_queue, request_transformer
from server.queue.model import Task, TaskStatus
from .blueprint import api
from .helpers import parse_enum_seq, parse_positive_int, get_log_storage


def parse_status():
    status = parse_enum_seq(request.args, "status", {status.value for status in TaskStatus})
    if status is not None:
        status = set(map(TaskStatus, status))
    return status


@api.route("/tasks/<task_id>", methods=["GET"])
def get_task(task_id):
    task = task_queue.get_task(task_id)
    if task is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Task id not found: {task_id}")
    return jsonify(task.asdict())


@api.route("/tasks/", methods=["GET"])
def list_tasks():
    status = parse_status()
    offset = parse_positive_int(request.args, "offset", 0)
    limit = parse_positive_int(request.args, "limit", 100)
    tasks, total = task_queue.list_tasks(status=status, limit=limit, offset=offset)
    return jsonify({"items": list(map(Task.asdict, tasks)), "total": total})


@api.route("/tasks/", methods=["POST"])
def post_task():
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    task_request = None
    try:
        task_request = request_transformer.fromdict(request_payload)
    except (ValueError, TypeError):
        abort(HTTPStatus.BAD_REQUEST.value, "Invalid request.")

    task = task_queue.dispatch(task_request)
    return jsonify(task.asdict())


@api.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    if not task_queue.exists(task_id):
        abort(HTTPStatus.NOT_FOUND.value, f"Task id not found: {task_id}")
    task_queue.delete(task_id)
    return "", HTTPStatus.NO_CONTENT.value


@api.route("/tasks/<task_id>", methods=["PATCH"])
def cancel_task(task_id):
    if not task_queue.exists(task_id):
        abort(HTTPStatus.NOT_FOUND.value, f"Task id not found: {task_id}")

    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    if request_payload != {"status": TaskStatus.REVOKED.value}:
        abort(HTTPStatus.BAD_REQUEST.value, "Invalid request.")

    task_queue.terminate(task_id)
    task = task_queue.get_task(task_id)
    return jsonify(task.asdict())


@api.route("/tasks/<task_id>/logs", methods=["GET"])
def get_task_logs(task_id):
    if not task_queue.exists(task_id):
        abort(HTTPStatus.NOT_FOUND.value, f"Task id not found: {task_id}")

    log_storage = get_log_storage()
    log_file_path = log_storage.get_log_file(task_id)
    if log_file_path is None or not os.path.isfile(log_file_path):
        return Response("", mimetype="text/plain")
    return send_from_directory(log_storage.directory, os.path.basename(log_file_path), mimetype="text/plain")
