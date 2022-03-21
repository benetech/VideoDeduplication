import hashlib
import os.path
from datetime import datetime
from typing import Sequence, Callable, Optional, Tuple

import luigi
import numpy as np
import pandas as pd
from cached_property import cached_property

from winnow.pipeline.luigi.frame_features import FrameFeaturesTask
from winnow.pipeline.luigi.platform import PipelineTask, ConstTarget
from winnow.pipeline.luigi.targets import FileGroupTarget
from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor
from winnow.search_engine import BlackList, SearchEngine
from winnow.search_engine.model import Template


class TemplateMatchesReportTarget(luigi.Target):
    """Template matches report target.

    Template matches report consists of two files:
      * ``template_matches__{timestamp}.csv`` - contains template matches details.
      * ``template_matches__{timestamp}.templates.hash`` - contains templates list hash.

    The templates list hash is required to check if templates are changed and hence
    a matching should be performed again to update report.
    """

    def __init__(self, templates: Sequence[Template], common_prefix: str, have_updates: Callable[[datetime], bool]):
        self.templates: Sequence[Template] = templates
        self.common_prefix: str = common_prefix
        self.file_group: FileGroupTarget = FileGroupTarget(
            common_prefix=common_prefix,
            suffixes=(".csv", ".templates.hash"),
            need_updates=have_updates,
        )

    def exists(self):
        return len(self.templates) == 0 or (
            self.file_group.exists() and self.latest_hash == hash_templates(self.templates)
        )

    @property
    def latest_hash(self) -> Optional[str]:
        """Get templates hash from the latest result."""
        latest_paths, _ = self.latest_result
        if latest_paths is None:
            return None
        _, hash_path = latest_paths
        with open(hash_path, "r") as hash_file:
            return hash_file.read().strip()

    @property
    def start_time(self) -> Optional[datetime]:
        """Get the time from which to continue template matching."""
        _, latest_time = self.latest_result
        if latest_time is None:
            return None
        if self.latest_hash != hash_templates(self.templates):
            return None
        return latest_time

    @property
    def latest_result(self) -> Tuple[Optional[Sequence[str]], Optional[datetime]]:
        """Get the latest existing result."""
        return self.file_group.latest_result

    def suggest_paths(self, time: datetime = None) -> Sequence[str]:
        """Suggest files paths."""
        return self.file_group.suggest_paths(time)


class TemplateMatchesReportTask(PipelineTask):
    """Performs template matching on the files with coll-path starting with the
    given ``prefix`` and produces the report on local file system.

    The template matches report consists of two files:
      * ``template_matches__{timestamp}.csv`` - contains template matches details.
      * ``template_matches__{timestamp}.templates.hash`` - contains templates list hash.

    The templates list hash is required to check if templates are changed and hence
    a matching should be performed again to update report.

    If the file collection has changed since the previous run, the template matching
    will be performed against updated/new files. If the template list has changed
    all the files from the collection (with the path ``prefix``) will be evaluated
    during the template matching.
    """

    prefix: str = luigi.Parameter(default=".")
    output_path: str = luigi.Parameter(default=None)
    clean_existing: bool = luigi.BoolParameter(default=True, significant=False)

    def run(self):
        target = self.output()
        previous_paths, _ = target.latest_result
        report_time = self.pipeline.coll.max_mtime(prefix=self.prefix)
        report_paths = target.suggest_paths(report_time)
        start_time = target.start_time
        self.logger.info(
            "Going to perform template matching on files with prefix '%s' since %s",
            self.prefix,
            start_time or "the very beginning",
        )

        black_list = self.black_list
        self.logger.info("Found %s file exclusions", black_list.time_exclusions_count)
        self.logger.info("Found %s time exclusions", black_list.time_exclusions_count)

        self.logger.info("Collecting file keys")
        file_keys = list(self.pipeline.coll.iter_keys(prefix=self.prefix, min_mtime=start_time))
        self.progress.increase(0.1)
        self.logger.info("Collected %s files to match templates", len(file_keys))

        self.logger.info("Starting template matching against %s templates", len(self.templates))
        se = SearchEngine(frame_features=self.pipeline.repr_storage.frame_level, black_list=black_list)
        template_matches_df = se.create_annotation_report(
            templates=self.templates,
            threshold=self.config.templates.distance,
            frame_sampling=self.config.proc.frame_sampling,
            distance_min=self.config.templates.distance_min,
            file_keys=file_keys,
            progress=self.progress.subtask(0.8),
        )
        self.logger.info("Found %s template matches", len(template_matches_df.index))

        self.logger.info("Going to combine previous results with new template matches")
        template_matches_df = self.merge_results(
            previous_paths=previous_paths,
            start_time=start_time,
            new_results_df=template_matches_df,
            progress=self.progress.subtask(0.1),
        )
        self.logger.info("Merging results done!")

        self.logger.info("Going to save report to %s", report_paths)
        matches_path, hash_path = report_paths
        matches_target, hash_target = luigi.LocalTarget(matches_path), luigi.LocalTarget(hash_path)
        with matches_target.open("w") as matches_file, hash_target.open("w") as hash_target:
            template_matches_df.to_csv(matches_file)
            hash_target.write(hash_templates(self.templates))
        self.logger.info("Report is saved to %s", report_paths)

        if self.clean_existing and report_paths != previous_paths and previous_paths is not None:
            for path in previous_paths:
                self.logger.info("Removing previous results from %s", path)
                os.remove(path)

    def output(self):
        return TemplateMatchesReportTarget(
            common_prefix=self.common_report_prefix,
            templates=self.templates,
            have_updates=lambda time: self.pipeline.coll.any(prefix=self.prefix, min_mtime=time),
        )

    def requires(self):
        return FrameFeaturesTask(config=self.config, prefix=self.prefix)

    @cached_property
    def common_report_prefix(self) -> str:
        """Report consists of ``matches.csv`` and ``templates.hash`` files with common path prefix."""
        if self.output_path:
            return self.output_path
        filename = f"template_matches_{self.config.templates.distance}dist"
        return os.path.join(self.output_directory, "template_matches", self.prefix, filename)

    @cached_property
    def templates(self) -> Sequence[Template]:
        """Get templates."""
        templates_folder = self.config.templates.source_path
        os.makedirs(templates_folder, exist_ok=True)
        self.logger.info("Loading templates from the folder: %s", templates_folder)
        templates = self.pipeline.template_loader.load_templates_from_folder(templates_folder)
        self.logger.info("Loaded %s templates: %s", len(templates), ", ".join([t.name for t in templates]))
        return templates

    @cached_property
    def black_list(self) -> BlackList:
        """Get templates black list."""
        return BlackList()  # Currently, not supported in non-database workflow

    def merge_results(
        self,
        previous_paths: Optional[Sequence[str]],
        start_time: datetime,
        new_results_df: pd.DataFrame,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ) -> pd.DataFrame:
        """Combine existing results with the new once."""

        # No previous work is found
        if previous_paths is None:
            progress.complete()
            return new_results_df

        # The work was done from scratch
        if start_time is None:
            progress.complete()
            return new_results_df

        progress.scale(1.0)
        previous_matches_path, _ = previous_paths
        previous_results_df = pd.read_csv(previous_matches_path, index_col=0)
        previous_results_df.fillna("", inplace=True)

        progress.scale(1.0)
        new_paths = set(new_results_df["path"])
        not_updated = np.array(~previous_results_df["path"].isin(new_paths))

        selected_previous_df = previous_results_df[not_updated]
        self.logger.info(
            "Selected %s of %s matches were selected from the previous results ",
            len(selected_previous_df.index),
            len(previous_results_df.index),
        )
        progress.increase(0.5)

        merged_results_df = pd.concat([selected_previous_df, new_results_df], ignore_index=True)
        self.logger.info(
            "Concatenated %s matches from previous results with %s new template matches (%s matches in total)",
            len(selected_previous_df.index),
            len(new_results_df.index),
            len(merged_results_df.index),
        )
        progress.complete()
        return merged_results_df


class DBTemplateMatchesTask(PipelineTask):
    """Performs template matching on the files with coll-path starting with the
    given ``prefix`` and store the results to the database.

    If the file collection has changed since the previous run, the template matching
    will be performed against updated/new files. If the template list has changed
    all the files from the collection (with the path ``prefix``) will be evaluated
    during the template matching.
    """

    prefix: str = luigi.Parameter(default=".")

    def output(self):
        if not self.config.database.use:
            return ConstTarget(exists=True)

    def requires(self):
        return FrameFeaturesTask(config=self.config, prefix=self.prefix)

    @cached_property
    def templates(self) -> Sequence[Template]:
        """Get template list."""
        return self.pipeline.template_loader.load_templates_from_database(
            database=self.pipeline.database,
            file_storage=self.pipeline.file_storage,
        )


def hash_template(template: Template, include_name: bool = False) -> str:
    """Get template hash.

    Guarantees:
      * The calculated hash is guaranteed to change if template example list has changed.
      * The result doesn't depend on the order of examples in the list or their storage-keys.
    """
    example_hashes = []
    for example_features in template.features:
        hash_sum = hashlib.sha256()
        hash_sum.update(example_features.tobytes(order="C"))
        example_hashes.append(hash_sum.hexdigest())
    example_hashes.sort()
    template_hash = hashlib.sha256()
    for example_hash in example_hashes:
        template_hash.update(example_hash.encode("utf-8"))
    if include_name:
        template_hash.update(template.name.encode("utf-8"))
    return template_hash.hexdigest()


def hash_templates(templates: Sequence[Template], include_names: bool = False) -> str:
    """Hash template list.

    The hash is guaranteed to change if any template is changed.
    The hash is independent of the templates order in the sequence.
    """
    hashes = sorted(hash_template(template, include_names) for template in templates)
    hash_sum = hashlib.sha256()
    for template_hash in hashes:
        hash_sum.update(template_hash.encode("utf-8"))
    return hash_sum.hexdigest()
