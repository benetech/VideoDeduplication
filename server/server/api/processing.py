import grpc
from flask import jsonify, request
from google.protobuf.json_format import MessageToDict

import rpc.rpc_pb2 as proto
import rpc.rpc_pb2_grpc as services
from .blueprint import api


@api.route("/processing/text", methods=["GET"])
def processing_text():
    """List file extensions."""
    query: str = request.args.get("query")

    with grpc.insecure_channel("localhost:50051") as channel:
        service = services.SemanticSearchStub(channel)
        req = proto.TextSearchRequest(query=query, min_similarity=0.0, max_count=1000)
        response = service.query_videos(req)
    return jsonify(MessageToDict(response))
