from http import HTTPStatus
from typing import Dict, Optional, Tuple

from flask import jsonify, request, abort
from sqlalchemy.exc import IntegrityError, DataError

from db.schema import Repository, RepositoryType, Contributor
from .blueprint import api
from .constants import ValidationErrors
from .helpers import (
    parse_positive_int,
)
from ..model import database, Transform


@api.route("/repositories/", methods=["GET"])
def list_repositories():
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    name = request.args.get("name", "", type=str).strip()

    query = database.session.query(Repository)

    # Apply optional name filter
    if name:
        query = query.filter(Repository.name.ilike(f"%{name}%"))

    total = query.count()
    repos = query.limit(limit).offset(offset).all()
    return jsonify(
        {
            "items": [Transform.repository(repo) for repo in repos],
            "total": total,
            "offset": offset,
        }
    )


@api.route("/repositories/<int:repository_id>", methods=["GET"])
def get_repository(repository_id):
    # Fetch repository from database
    repository = database.session.query(Repository).get(repository_id)

    # Handle repository not found
    if repository is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Repository id not found: {repository_id}")

    return jsonify(Transform.repository(repository))


def validate_required_string(
    data: Dict, attr_name: str, min_length: int = 1, max_length: int = 1000, strip: bool = True
):
    """Check presense of required string attribute."""

    attr_value = data.get(attr_name)

    if attr_value is None:
        return f"'{attr_name}' is missing", {attr_name: ValidationErrors.MISSING_REQUIRED.value}

    if not isinstance(attr_value, str):
        return f"'{attr_name}' must be a string value", {attr_name: ValidationErrors.INVALID_VALUE.value}

    if strip:
        attr_value = attr_value.strip()
        data[attr_name] = attr_value

    if len(attr_value) < min_length:
        return f"'{attr_name}' must contain at least {min_length} characters", {
            attr_name: ValidationErrors.INVALID_VALUE.value
        }

    if max_length is not None and len(attr_value) > max_length:
        return f"'{attr_name}' cannot be longer than {max_length} characters", {
            attr_name: ValidationErrors.OUT_OF_BOUNDS.value
        }


def validate_repo_name(data: Dict, current: Optional[Repository] = None) -> Tuple[str, Dict[str, str]]:
    """Validate repository name."""

    missing_error = validate_required_string(data, "name")
    if missing_error:
        return missing_error

    name_exists = database.session.query(Repository).filter(Repository.name == data["name"]).count() > 0
    if name_exists and (current is None or data["name"] != current.name):
        return f"Repository name already exists: {data['name']}", {"name": ValidationErrors.UNIQUE_VIOLATION.value}


def validate_repo_type(data: Dict) -> Tuple[str, Dict[str, str]]:
    """Validate repository type."""

    missing_error = validate_required_string(data, "type")
    if missing_error:
        return missing_error

    try:
        data["type"] = RepositoryType(data["type"])
    except ValueError:
        return "Invalid repository type", {"type": ValidationErrors.INVALID_VALUE.value}


def validate_new_repo_dto(data: Dict) -> Tuple[str, Dict[str, str]]:
    """Validate new repository DTO.

    Returns:
        error message and a dict of invalid fields -> error codes.
    """

    expected_fields, actual_fields = {"name", "address", "login", "type"}, set(data.keys())
    missing_fields = expected_fields - actual_fields
    if missing_fields:
        return f"Payload must have all of the required fields: {expected_fields}", {
            field: ValidationErrors.MISSING_REQUIRED.value for field in missing_fields
        }

    unknown_fields = actual_fields - expected_fields
    if unknown_fields:
        return f"Payload contains unexpected fields: {unknown_fields}", {}

    name_error = validate_repo_name(data)
    if name_error is not None:
        return name_error

    type_error = validate_repo_type(data)
    if type_error is not None:
        return type_error

    address_error = validate_required_string(data, "address")
    if address_error is not None:
        return address_error

    login_error = validate_required_string(data, "login")
    if login_error is not None:
        return login_error

    return None, {}


@api.route("/repositories/", methods=["POST"])
def create_repository():
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    # Validate payload
    error, fields = validate_new_repo_dto(request_payload)
    if error is not None:
        return (
            jsonify({"error": error, "code": HTTPStatus.BAD_REQUEST.value, "fields": fields}),
            HTTPStatus.BAD_REQUEST.value,
        )

    # Create repo
    repo = Repository(
        name=request_payload["name"],
        repository_type=request_payload["type"],
        network_address=request_payload["address"],
        account_id=request_payload["login"],
    )
    database.session.add(repo)

    # Try to commit session
    try:
        database.session.commit()
    except (IntegrityError, DataError):
        abort(HTTPStatus.BAD_REQUEST.value, "Data integrity violation.")

    return jsonify(Transform.repository(repo))


def validate_update_repo_dto(data: Dict, current: Repository) -> Tuple[str, Dict[str, str]]:
    """Validate update-repository DTO.

    Returns:
        error message and a dict of invalid fields -> error codes.
    """

    expected_fields, actual_fields = {"name"}, set(data.keys())
    unknown_fields = actual_fields - expected_fields
    if unknown_fields:
        return f"Payload contains unexpected fields: {unknown_fields}", {}

    name_error = validate_repo_name(data, current)
    if name_error is not None:
        return name_error

    return None, {}


@api.route("/repositories/<int:repository_id>", methods=["PATCH"])
def update_repository(repository_id):
    # Fetch repo from database
    repo = database.session.query(Repository).get(repository_id)

    # Handle repository not found
    if repo is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Repository id not found: {repository_id}")

    # Get payload
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    # Validate payload
    error, fields = validate_update_repo_dto(repo, request_payload)
    if error is not None:
        return (
            jsonify({"error": error, "code": HTTPStatus.BAD_REQUEST.value, "fields": fields}),
            HTTPStatus.BAD_REQUEST.value,
        )

    repo.name = request_payload.get("name", repo.name)

    try:
        database.session.commit()
    except IntegrityError:
        abort(HTTPStatus.BAD_REQUEST.value, "Data integrity violation.")

    return jsonify(Transform.repository(repo))


@api.route("/repositories/<int:repository_id>", methods=["DELETE"])
def delete_repository(repository_id):
    # Fetch repository from database
    repository = database.session.query(Repository).get(repository_id)

    # Handle repository not found
    if repository is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Repository id not found: {repository_id}")

    # Delete example
    database.session.delete(repository)
    database.session.commit()
    return "", HTTPStatus.NO_CONTENT.value


@api.route("/repositories/<int:repository_id>/contributors/", methods=["GET"])
def list_repo_contributors(repository_id):
    # Fetch repository from database
    repository = database.session.query(Repository).get(repository_id)

    # Handle repository not found
    if repository is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Repository id not found: {repository_id}")

    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    name = request.args.get("name", "", type=str).strip()

    query = database.session.query(Contributor).filter(Contributor.repository == repository)

    # Apply optional name filter
    if name:
        query = query.filter(Contributor.name.ilike(f"%{name}%"))

    total = query.count()
    constributors = query.limit(limit).offset(offset).all()
    return jsonify(
        {
            "items": [Transform.contributor(contributor) for contributor in constributors],
            "total": total,
            "offset": offset,
        }
    )
