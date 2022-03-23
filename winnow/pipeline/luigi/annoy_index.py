import os

import luigi
from annoy import AnnoyIndex

from winnow.pipeline.luigi.condense import CondenseFingerprintsTask, CondensedFingerprints
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.targets import FileGroupTarget


class AnnoyIndexTask(PipelineTask):
    """Build Annoy index."""

    prefix: str = luigi.Parameter(default=".")
    fingerprint_size: int = luigi.IntParameter(default=500)
    metric: str = luigi.Parameter(default="angular")
    n_trees: int = luigi.IntParameter(default=10)
    clean_existing: bool = luigi.BoolParameter(default=True, significant=False)

    def run(self):
        target = self.output()
        new_results_time = self.pipeline.coll.max_mtime(prefix=self.prefix)
        previous_results_paths, _ = target.latest_result

        self.logger.info("Loading condensed fingerprints")
        condensed: CondensedFingerprints = self.input().read(self.progress.subtask(0.1))
        self.logger.info("Loaded %s condensed fingerprints", len(condensed))

        self.logger.info("Building Annoy index")
        annoy_index = AnnoyIndex(self.fingerprint_size, "angular")
        fitting_progress = self.progress.bar(0.6, scale=len(condensed), unit="sigs")
        for i, fingerprint in enumerate(condensed.fingerprints):
            annoy_index.add_item(i, fingerprint)
            fitting_progress.increase(1)
        fitting_progress.complete()
        self.logger.info("Added %s fingerprints to the index", len(condensed))

        self.logger.info("Building annoy index.")
        annoy_index.build(self.n_trees)
        self.progress.increase(0.25)
        self.logger.info("Annoy index is prepared.")

        self.logger.info("Saving annoy index.")
        index_path, keys_path = target.suggest_paths(new_results_time)
        os.makedirs(os.path.dirname(index_path), exist_ok=True)
        annoy_index.save(index_path)
        condensed.file_keys_df.to_csv(keys_path)

        if self.clean_existing and previous_results_paths is not None:
            for path in previous_results_paths:
                self.logger.info("Removing previous results: %s", path)
                os.remove(path)

    def output(self):
        coll = self.pipeline.coll
        file_name = f"annoy_{self.metric}_{self.n_trees}trees"
        return FileGroupTarget(
            common_prefix=os.path.join(self.output_directory, "annoy", self.prefix, file_name),
            suffixes=(".annoy", ".files.csv"),
            need_updates=lambda time: coll.any(prefix=self.prefix, min_mtime=time),
        )

    def requires(self):
        return CondenseFingerprintsTask(config=self.config, prefix=self.prefix)
