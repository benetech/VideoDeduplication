import logging
import os
from concurrent import futures

import grpc
from google.protobuf.json_format import MessageToJson

import rpc.rpc_pb2 as proto
import rpc.rpc_pb2_grpc as services
from rpc.embeddings import EmbeddingLoader
from rpc.errors import unavailable
from rpc.logging import configure_logging
from winnow.config.path import resolve_config_path
from winnow.pipeline.pipeline_context import PipelineContext, ComponentNotAvailable
from winnow.text_search.main_utils import VideoSearch
from winnow.utils.config import resolve_config

logger = logging.getLogger("rpc.server")


class SemanticSearch(services.SemanticSearchServicer):
    """Provides methods that implement functionality of the SemanticSearch"""

    def __init__(self, pipeline: PipelineContext):
        self.pipeline: PipelineContext = pipeline

    def query_videos(
        self,
        request: proto.TextSearchRequest,
        context: grpc.ServicerContext,
    ) -> proto.TextSearchResults:
        try:
            search_engine = self._get_search_engine(context)
            file_ids, scores, details = search_engine.query(
                request.query,
                min_similarity=request.min_similarity,
                max_count=request.max_count,
            )
            found = []
            for file_id, score in zip(file_ids, scores):
                found.append(proto.FoundVideo(id=file_id, score=score))
            return proto.TextSearchResults(
                videos=found,
                original_query=details["original_query"],
                tokens=details["tokens"],
                clean_tokens=details["clean_tokens"],
                human_readable=details["human_readable"],
                score=details["score"],
            )
        except Exception:
            logger.exception("Exception while processing request: %s", MessageToJson(request))
            raise

    def get_status(
        self,
        request: proto.StatusRequest,
        context: grpc.ServicerContext,
    ) -> proto.StatusResponse:
        try:
            _ = self.pipeline.text_search_engine
            return proto.StatusResponse(status=True)
        except ComponentNotAvailable:
            return proto.StatusResponse(status=False)
        except Exception:
            logger.exception("Exception while processing request: %s", MessageToJson(request))
            raise

    def _get_search_engine(self, context: grpc.ServicerContext) -> VideoSearch:
        """Try to get search engine and gracefully handle exceptions."""
        try:
            return self.pipeline.text_search_engine
        except ComponentNotAvailable as error:
            raise unavailable(context, str(error))


class EmbeddingsService(services.EmbeddingsServicer):
    def __init__(self, loader: EmbeddingLoader):
        self._loader = loader

    def query_nearest_neighbors(
        self,
        request: proto.NearestNeighborsRequest,
        context: grpc.ServicerContext,
    ) -> proto.NearestNeighborsResults:
        index = self._loader.load(request.algorithm)
        if index is None:
            return proto.NearestNeighborsResults(neighbors=[])
        found = index.query(x=request.x, y=request.y, max_distance=request.max_distance, max_count=request.max_count)
        return proto.NearestNeighborsResults(neighbors=found)

    def get_status(self, request: proto.EmbeddingsStatusRequest, context: grpc.ServicerContext) -> proto.StatusResponse:
        index = self._loader.load(request.algorithm)
        available = index is not None
        return proto.StatusResponse(status=available)


def initialize_search_engine(pipeline: PipelineContext):
    """Try to eagerly initialize semantic search engine."""
    logger.info("Trying to initialize semantic search engine.")
    try:
        engine = pipeline.text_search_engine
        logger.info("Semantic search engine is initialized successfully.")
        return engine
    except ComponentNotAvailable:
        logger.warning("Text search engine is not available. Did you forget to create index?")


def serve(host: str, port: int, pipeline: PipelineContext, eager: bool = False):
    embeddings_loader = EmbeddingLoader(pipeline)
    embeddings_service = EmbeddingsService(loader=embeddings_loader)
    semantic_search = SemanticSearch(pipeline)
    if eager:
        initialize_search_engine(pipeline)
        embeddings_loader.load("pacmap")
        embeddings_loader.load("t-sne")
        embeddings_loader.load("trimap")
        embeddings_loader.load("umap")

    listen_address = f"{host}:{port}"
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    services.add_SemanticSearchServicer_to_server(semantic_search, server)
    services.add_EmbeddingsServicer_to_server(embeddings_service, server)
    server.add_insecure_port(listen_address)
    logger.info("JusticeAI RPC server is initialized.")

    logger.info("Listening incoming connections on %s", listen_address)
    server.start()
    server.wait_for_termination()


def main():
    configure_logging()
    config_path = resolve_config_path()
    config = resolve_config(config_path)
    pipeline = PipelineContext(config)
    logger.info("Resolved config path: %s", config_path)

    host = os.environ.get("RPC_SERVER_HOST", "localhost")
    port = os.environ.get("RPC_SERVER_PORT", "50051")
    eager = "RPC_SERVER_EAGER_INITIALIZE" in os.environ
    serve(host, port, pipeline, eager)


if __name__ == "__main__":
    main()
