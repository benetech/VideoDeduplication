import json
from typing import List, Dict, Tuple

import luigi
import pandas as pd
from cached_property import cached_property
from dataclasses import replace
from sqlalchemy import tuple_

from db.schema import Files
from winnow.pipeline.luigi.frame_features import FrameFeaturesTask
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.search_engine import SearchEngine, BlackList
from winnow.search_engine.model import Frame, Template
from winnow.utils.iterators import chunks


class FindFrameTask(PipelineTask):
    """Find similar frames in existing videos."""

    frame_video_path: str = luigi.Parameter()
    frame_time_millis: float = luigi.FloatParameter()
    among_files_prefix: str = luigi.Parameter(default=".")
    output_path: str = luigi.Parameter()

    def requires(self):
        return FrameFeaturesTask(config=self.config, prefix=self.among_files_prefix)

    def output(self):
        return luigi.LocalTarget(self.output_path)

    def run(self):
        config = self.pipeline.config

        local_fs_frame = replace(self.frame, path=self.pipeline.coll.local_fs_path(self.frame.path))
        template = self.pipeline.template_loader.load_template_from_frame(local_fs_frame)
        self.logger.info("Loaded temporary template: %s", template.name)

        exclude_frame_origin = self.exclude_frame_origin(template)
        self.logger.info("Frame source file is excluded from the search scope.")

        frame_features = self.pipeline.repr_storage.frame_level
        se = SearchEngine(frame_features=frame_features, black_list=exclude_frame_origin)
        template_matches = se.create_annotation_report(
            templates=[template],
            threshold=config.templates.distance,
            frame_sampling=config.proc.frame_sampling,
            distance_min=config.templates.distance_min,
        )

        tm_entries = template_matches[["path", "hash"]]
        tm_entries["template_matches"] = template_matches.drop(columns=["path", "hash"]).to_dict("records")

        self.logger.info("Found %s frame matches", len(tm_entries))

        found_frames = self.get_frame_matches(tm_entries)
        with self.output().open("w") as output:
            json.dump(found_frames, output, sort_keys=True, indent=2)
        self.logger.info("Saved %s matches to %s", len(found_frames), self.output_path)

    @cached_property
    def frame(self) -> Frame:
        """Get wanted frame."""
        return Frame(path=self.frame_video_path, time=self.frame_time_millis)

    def exclude_frame_origin(self, template: Template) -> BlackList:
        """BlackList to exclude the video from which the wanted frame originates."""
        black_list = BlackList()
        origin_key = self.pipeline.coll.file_key(self.frame_video_path)
        black_list.exclude_file(
            template_name=template.name,
            file_path=origin_key.path,
            file_hash=origin_key.hash,
        )
        return black_list

    def get_frame_matches(self, template_matches_df: pd.DataFrame) -> List[Dict]:
        """Convert pandas DataFrame with template-matches to frame matches collection."""

        file_ids = self.get_file_ids(template_matches_df)
        results = []
        for file_path, file_hash, record in template_matches_df.values:
            results.append(
                dict(
                    file_id=file_ids.get((file_path, file_hash), None),
                    file_path=file_path,
                    file_hash=file_hash,
                    start_ms=record["start_ms"],
                    end_ms=record["end_ms"],
                )
            )
        return results

    def get_file_ids(self, template_matches_df: pd.DataFrame) -> Dict[Tuple[str, str], int]:
        """Get matched files database ids."""
        if not self.pipeline.config.database.use:
            return {}

        # Get path-hash pairs for all matched files
        matched_files = set(tuple(entry) for entry in template_matches_df[["path", "hash"]].values)

        # Get matched files index (path,hash) => file id
        file_index = {}
        with self.pipeline.database.session_scope() as session:
            for chunk in chunks(matched_files, size=10000):
                files = session.query(Files).filter(tuple_(Files.file_path, Files.sha256).in_(chunk)).all()
                for file in files:
                    file_index[(file.file_path, file.sha256)] = file.id
        return file_index
