from threading import Lock
from typing import List, Dict, Optional, Tuple

import numpy as np
from annoy import AnnoyIndex

import rpc.rpc_pb2 as proto
from winnow.pipeline.luigi.condense import CondensedFingerprints
from winnow.pipeline.luigi.embeddings import (
    EmbeddingsTask,
    UmapEmbeddingsTask,
    TSNEEmbeddingsTask,
    TriMapEmbeddingsTask,
    PaCMAPEmbeddingsTask,
)
from winnow.pipeline.luigi.embeddings_annoy_index import (
    EmbeddingsAnnoyIndexTask,
    PaCMAPAnnoyIndexTask,
    TriMAPAnnoyIndexTask,
    UMAPAnnoyIndexTask,
    TSNEAnnoyIndexTask,
)
from winnow.pipeline.luigi.utils import FileKeyDF
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.storage.file_key import FileKey


class EmbeddingsIndex:
    def __init__(self, annoy_index: AnnoyIndex, files: List[FileKey], positions: Dict[FileKey, np.ndarray]):
        self._annoy_index: AnnoyIndex = annoy_index
        self._files: List[FileKey] = files
        self._positions: Dict[FileKey, np.ndarray] = positions

    def query(
        self,
        x: float,
        y: float,
        max_count: int = 10,
        max_distance: Optional[float] = None,
    ) -> List[proto.FoundNeighbor]:
        if max_distance <= 0:
            max_distance = None
        indices, distances = self._annoy_index.get_nns_by_vector([x, y], max_count, include_distances=True)
        files = [self._files[i] for i in indices]
        results: List[proto.FoundNeighbor] = []
        for file, distance in zip(files, distances):
            if max_distance is not None and distance > max_distance:
                break
            x, y = self._positions[file]
            results.append(
                proto.FoundNeighbor(
                    file_path=file.path,
                    file_hash=file.hash,
                    distance=distance,
                    x=x,
                    y=y,
                )
            )
        return results


class EmbeddingLoader:
    def __init__(self, pipeline: PipelineContext):
        self._pipeline: PipelineContext = pipeline
        self._cache: Dict[str, EmbeddingsIndex] = {}
        self._lock = Lock()

    def load(self, algorithm: str) -> Optional[EmbeddingsIndex]:
        with self._lock:
            if algorithm not in self._cache:
                index = self._do_load(algorithm)
                if index is not None:
                    self._cache[algorithm] = index
            return self._cache.get(algorithm)

    def _do_load(self, algorithm: str) -> Optional[EmbeddingsIndex]:
        """Do load embeddings index."""
        embeddings_task, annoy_task = self._task(algorithm)
        if embeddings_task is None or annoy_task is None:
            return None
        embeddings: CondensedFingerprints = embeddings_task.output().read()
        if embeddings is None:
            return None

        annoy_output = annoy_task.output()
        annoy_paths, _ = annoy_output.latest_result
        if annoy_paths is None:
            return None

        annoy_index_path, annoy_files_path = annoy_paths
        annoy_index = AnnoyIndex(2, "euclidean")
        annoy_index.load(annoy_index_path)
        annoy_files_df = FileKeyDF.read_csv(annoy_files_path)
        positions: Dict[FileKey, np.ndarray] = {}
        for i, file_key in enumerate(embeddings.to_file_keys()):
            positions[file_key] = embeddings.fingerprints[i]
        return EmbeddingsIndex(annoy_index, FileKeyDF.to_file_keys(annoy_files_df), positions)

    def _task(self, algorithm: str) -> Tuple[Optional[EmbeddingsTask], Optional[EmbeddingsAnnoyIndexTask]]:
        config = self._pipeline.config
        if algorithm == "pacmap":
            return PaCMAPEmbeddingsTask(config=config), PaCMAPAnnoyIndexTask(config=config)
        elif algorithm == "trimap":
            return TriMapEmbeddingsTask(config=config), TriMAPAnnoyIndexTask(config=config)
        elif algorithm == "umap":
            return UmapEmbeddingsTask(config=config), UMAPAnnoyIndexTask(config=config)
        elif algorithm == "t-sne":
            return TSNEEmbeddingsTask(config=config), TSNEAnnoyIndexTask(config=config)
        else:
            return None, None
