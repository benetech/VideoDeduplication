from typing import Optional

import grpc
from dataclasses import dataclass, asdict
from flask import jsonify

import rpc.rpc_pb2 as proto
from .blueprint import api
from .helpers import semantic_search


@dataclass
class ServiceStatus:
    """Service status."""

    available: bool
    details: Optional[str] = None


def is_semantic_search_available() -> ServiceStatus:
    """Get semantic search availability."""
    try:
        with semantic_search() as service:
            response = service.get_status(proto.StatusRequest())
            return ServiceStatus(available=response.status)
    except grpc.RpcError as e:
        details = str(e)
        if hasattr(e, "details"):
            details = e.details()
        return ServiceStatus(available=False, details=details)


@api.route("/health/", methods=["GET"])
def get_health():
    return jsonify({"semantic_search": asdict(is_semantic_search_available())})
