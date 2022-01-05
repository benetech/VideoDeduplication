from http import HTTPStatus
from typing import Dict, Optional, Tuple

from flask import jsonify, request, abort
from sqlalchemy import func, distinct
from sqlalchemy.exc import IntegrityError, DataError

from db.schema import Repository, RepositoryType, Contributor, Files
from remote import RemoteRepository, make_client
from .blueprint import api
from .constants import ValidationErrors
from .helpers import (
    parse_positive_int,
    get_repos_dao,
    get_config,
)
from ..config import OnlinePolicy
from ..model import database, Transform, RepoStats


def make_stats(entry: Tuple[Repository, int, int]):
    """Make (repository,stats) pair from list-query results entry."""
    repo, partners_count, pulled_fungerprint_count = entry
    stats = RepoStats(
        partners_count=partners_count,
        total_fingerprints_count=repo.total_fingerprint_count or 0,
        pushed_fingerprints_count=repo.pushed_fingerprint_count or 0,
        pulled_fingerprints_count=pulled_fungerprint_count,
    )
    return repo, stats


def fetch_repo(repository_id: int) -> Tuple[Optional[Repository], Optional[RepoStats]]:
    """Fetch repository with statistics by id."""
    entry = (
        database.session.query(Repository, func.count(distinct(Contributor.id)), func.count(distinct(Files.id)))
        .filter(Repository.id == repository_id)
        .outerjoin(Repository.contributors)
        .outerjoin(Contributor.files)
        .group_by(Repository.id)
        .one_or_none()
    )
    if entry is None:
        return None, None
    else:
        return make_stats(entry)


@api.route("/repositories/", methods=["GET"])
def list_repositories():
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    name = request.args.get("name", "", type=str).strip()

    query = (
        database.session.query(Repository, func.count(distinct(Contributor.id)), func.count(distinct(Files.id)))
        .outerjoin(Repository.contributors)
        .outerjoin(Contributor.files)
        .group_by(Repository.id)
    )

    # Apply optional name filter
    if name:
        query = query.filter(Repository.name.ilike(f"%{name}%"))

    total = query.count()

    results = query.limit(limit).offset(offset).all()
    return jsonify(
        {
            "items": [Transform.repository(repo, stats) for (repo, stats) in map(make_stats, results)],
            "total": total,
            "offset": offset,
        }
    )


@api.route("/repositories/<int:repository_id>", methods=["GET"])
def get_repository(repository_id: int):
    # Fetch repository from database
    repo, stats = fetch_repo(repository_id)

    # Handle repository not found
    if repo is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Repository id not found: {repository_id}")

    return jsonify(Transform.repository(repo, stats))


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


def validate_new_repo_dto(data: Dict, check_name=True) -> Tuple[str, Dict[str, str]]:
    """Validate new repository DTO.

    Returns:
        error message and a dict of invalid fields -> error codes.
    """

    expected_fields, actual_fields = {"name", "address", "login", "type", "credentials"}, set(data.keys())
    missing_fields = expected_fields - actual_fields
    if missing_fields:
        return f"Payload must have all of the required fields: {expected_fields}", {
            field: ValidationErrors.MISSING_REQUIRED.value for field in missing_fields
        }

    unknown_fields = actual_fields - expected_fields
    if unknown_fields:
        return f"Payload contains unexpected fields: {unknown_fields}", {}

    if check_name:
        name_error = validate_repo_name(data)
        if name_error is not None:
            return name_error

    type_error = validate_repo_type(data)
    if type_error is not None:
        return type_error

    address_error = validate_required_string(data, "address")
    if address_error is not None:
        return address_error

    credentials_error = validate_required_string(data, "credentials")
    if credentials_error is not None:
        return credentials_error

    login_error = validate_required_string(data, "login")
    if login_error is not None:
        return login_error

    return None, {}


def save_repo(data: Dict) -> Repository:
    """Do save new repository."""
    # Try to save new repository
    try:
        # Use repository DAO to ensure
        # credentials are saved correctly
        repos_dao = get_repos_dao()
        return repos_dao.add_entity(
            repository=Repository(
                name=data["name"],
                network_address=data["address"],
                repository_type=data["type"],
                account_id=data["login"],
            ),
            credentials=data["credentials"],
        )
    except (IntegrityError, DataError):
        abort(HTTPStatus.BAD_REQUEST.value, "Data integrity violation.")


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

    repo = save_repo(request_payload)
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
    repo, stats = fetch_repo(repository_id)

    # Handle repository not found
    if repo is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Repository id not found: {repository_id}")

    # Get payload
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    # Validate payload
    error, fields = validate_update_repo_dto(request_payload, repo)
    if error is not None:
        return (
            jsonify({"error": error, "code": HTTPStatus.BAD_REQUEST.value, "fields": fields}),
            HTTPStatus.BAD_REQUEST.value,
        )

    # Use repository DAO to ensure correct security handling
    repo_dao = get_repos_dao()
    current_name = repo.name
    updated_name = request_payload.get("name", repo.name)
    if current_name != updated_name:
        repo_dao.rename(current_name, updated_name)

    return jsonify(Transform.repository(repo, stats))


@api.route("/repositories/<int:repository_id>", methods=["DELETE"])
def delete_repository(repository_id):
    repo_dao = get_repos_dao()
    repo = repo_dao.get_by_id(repository_id)

    # Handle repository not found
    if repo is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Repository id not found: {repository_id}")

    repo_dao.remove(repo)
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


@api.route("/repositories/check", methods=["POST"])
def check_credentials():
    """Check credentials validity."""
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    # Validate payload
    error, fields = validate_new_repo_dto(request_payload, check_name=False)
    if error is not None:
        return (
            jsonify({"error": error, "code": HTTPStatus.BAD_REQUEST.value, "fields": fields}),
            HTTPStatus.BAD_REQUEST.value,
        )

    # Do not perform any checks if online-workflow is explicitly disabled
    config = get_config()
    if config.online_policy == OnlinePolicy.OFFLINE:
        return jsonify({"confirm_credentials": False})

    repo = RemoteRepository(
        name=request_payload["name"],
        type=request_payload["type"],
        user=request_payload["login"],
        address=request_payload["address"],
        credentials=request_payload["credentials"],
    )

    try:
        make_client(repo).get_stats()
        return jsonify({"confirm_credentials": True})
    except Exception:
        return jsonify({"confirm_credentials": False})


@api.route("/repositories/<int:repository_id>/sync", methods=["POST"])
def sync_repository(repository_id):
    repo_dao = get_repos_dao()
    repo = repo_dao.get_by_id(repository_id)

    # Handle repository not found
    if repo is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Repository id not found: {repository_id}")

    client = make_client(repo)
    repo_stats = client.get_stats()
    repo_dao.update_stats(stats=repo_stats)

    # Fetch repository from database
    repo, stats = fetch_repo(repository_id)
    return jsonify(Transform.repository(repo, stats))
