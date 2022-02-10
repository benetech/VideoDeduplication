import logging
import os
from concurrent import futures

import grpc

import rpc.rpc_pb2 as proto
import rpc.rpc_pb2_grpc as services
from winnow.text_search.main_utils import VideoSearch
from winnow.utils.config import resolve_config
from winnow.utils.logging import configure_logging_server


class SemanticSearch(services.SemanticSearchServicer):
    """Provides methods that implement functionality of the SemanticSearch"""

    def __init__(self, search_engine: VideoSearch):
        self.search_engine: VideoSearch = search_engine

    def query_videos(
        self, request: proto.TextSearchRequest, context: grpc.aio.ServicerContext
    ) -> proto.TextSearchResults:
        files, distances, details = self.search_engine.query(request.query)
        found = []
        for file, distance in zip(files, distances):
            found.append(proto.FoundVideo(path=file, hash="", distance=distance))
        return proto.TextSearchResults(
            videos=found,
            original_query=details["original_query"],
            tokens=details["tokens"],
            clean_tokens=details["clean_tokens"],
            human_readable=details["human_readable"],
            score=details["score"],
        )


def make_search_engine() -> VideoSearch:
    config = resolve_config()
    signatures_folder = os.path.abspath(os.path.join(config.repr.directory, "video_signatures"))
    search_engine = VideoSearch(signatures_folder)
    return search_engine


def serve(host: str, port: int, logger: logging.Logger):
    search_engine = make_search_engine()
    logger.info("Created search engine.")

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    semantic_search = SemanticSearch(search_engine)
    services.add_SemanticSearchServicer_to_server(semantic_search, server)
    listen_address = f"{host}:{port}"
    server.add_insecure_port(listen_address)
    logger.info("Starting server on %s", listen_address)
    server.start()
    server.wait_for_termination()


def main():
    host = os.environ.get("RPC_SERVER_HOST", "localhost")
    port = os.environ.get("RPC_SERVER_PORT", "50051")
    log = configure_logging_server(__name__)
    serve(host, port, log)


if __name__ == "__main__":
    main()
