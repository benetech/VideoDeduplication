import os
from typing import Sequence, Dict, Tuple

import luigi
import numpy as np
from sqlalchemy import tuple_

from db.schema import Files
from winnow.pipeline.luigi.condense import CondenseFingerprintsTask, CondensedFingerprints, CondensedFingerprintsTarget
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.targets import FileGroupTarget
from winnow.pipeline.progress_monitor import ProgressBar, LazyProgress
from winnow.text_search.similarity_index import AnnoySimilarityIndex
from winnow.utils.iterators import chunks


class PrepareTextSearchTask(PipelineTask):
    """Prepare text search task."""

    clean_existing: bool = luigi.BoolParameter(default=True, significant=False)

    def output(self):
        videos = self.pipeline.coll
        return FileGroupTarget(
            common_prefix=self.pipeline.text_search_index_prefix,
            suffixes=self.pipeline.text_search_index_suffixes,
            need_updates=lambda time: videos.any(min_mtime=time),
        )

    def requires(self):
        return CondenseFingerprintsTask(config=self.config, prefix=".")

    def run(self):
        target = self.output()
        previous_results, _ = target.latest_result

        self.logger.info("Loading condensed fingerprints.")
        condensed_input: CondensedFingerprintsTarget = self.input()
        _, new_timestamp = condensed_input.latest_result
        condensed: CondensedFingerprints = condensed_input.read(self.progress.subtask(0.1))
        self.logger.info("Loaded %s fingerprints with timestamp %s", len(condensed), new_timestamp)

        self.logger.info("Getting database ids.")
        file_ids = []
        path_hashes = condensed.file_keys_df.to_pandas().itertuples(index=False, name=None)
        retrieve_progress = self.progress.subtask(0.2).scale(len(condensed.file_keys_df.index))
        retrieve_progress = ProgressBar(retrieve_progress, unit="ids")
        for chunk in chunks(path_hashes, size=10000):
            retrieved_ids = self.query_file_ids(chunk)
            file_ids.extend(retrieved_ids)
            retrieve_progress.increase(len(retrieved_ids))
        retrieve_progress.complete()
        self.logger.info("Loaded %s database ids", len(file_ids))

        self.logger.info("Loading the text search model")
        model = self.pipeline.text_search_model

        self.logger.info("Converting fingerprints using the text-search model")
        vectors = []
        conversion_progress = self.progress.subtask(0.2).scale(len(condensed))
        conversion_progress = LazyProgress(ProgressBar(conversion_progress, unit="fingerprints"))
        for fingerprint in condensed.fingerprints:
            vector = model.embed_vis(fingerprint)[0].numpy()
            vectors.append(vector)
            conversion_progress.increase(1)
        conversion_progress.complete()
        self.logger.info("Converted %s fingerprints to semantic model vectors", len(vectors))

        self.logger.info("Building annoy text search index.")
        index = AnnoySimilarityIndex()
        index.fit(file_ids, np.array(vectors), progress=self.progress.remaining())

        self.logger.info("Saving text-search index.")
        index_path, ids_path = target.suggest_paths(new_timestamp)
        index.save(index_path=index_path, ids_path=ids_path)

        if self.clean_existing and previous_results is not None:
            for path in previous_results:
                self.logger.info("Removing previous results: %s", path)
                os.remove(path)

    def query_file_ids(self, path_hashes) -> Sequence[int]:
        """Query file ids for the given path-hash pairs.

        NOTE: it is essential to return ids in the same order as the corresponding (path,hash) pairs!
        """
        with self.pipeline.database.session_scope() as session:
            path_hash_pairs = tuple(path_hashes)
            query = session.query(Files.id, Files.file_path, Files.sha256)
            query = query.filter(Files.contributor == None)  # noqa: E711
            query = query.filter(tuple_(Files.file_path, Files.sha256).in_(path_hash_pairs))
            results = query.all()

        index: Dict[Tuple[str, str], int] = {}
        for file_id, file_path, file_hash in results:
            index[(file_path, file_hash)] = file_id
        return [index[path_hash] for path_hash in path_hashes]
