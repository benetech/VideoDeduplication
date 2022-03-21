import logging
import os
import shutil
from glob import glob
from typing import Iterator, Sequence, Optional

import numpy as np
import pandas as pd
from scipy.spatial.distance import cdist

from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor
from winnow.search_engine.black_list import BlackList, Cover
from winnow.search_engine.model import Template
from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.file_key import FileKey
from winnow.utils.network import download_file

_logger = logging.getLogger(__name__)


class SearchEngine:

    # Columns in the search engine reports
    report_columns = (
        "path",
        "hash",
        "template_name",
        "start_ms",
        "end_ms",
        "mean_distance_sequence",
        "min_distance_video",
        "min_distance_ms",
    )

    def __init__(
        self,
        frame_features: BaseReprStorage,
        black_list: BlackList = None,
    ):
        self._frame_features: BaseReprStorage = frame_features
        self.black_list: BlackList = black_list or BlackList()

    def create_annotation_report(
        self,
        templates: Sequence[Template],
        threshold: float = 0.07,
        frame_sampling: int = 1,
        distance_min: float = 0.05,
        file_keys: Optional[Sequence[FileKey]] = None,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ) -> pd.DataFrame:
        """Find the given templates in all the available files.

        Creates an annotation report suitable for annotation (using our own Annotator class)

        Returns:
            [pandas.DataFrame] -- Dataframe in the same format as the output
            from the "generate_matches.py" script
        """
        _logger.info("Searching for templates: %s", [template.name for template in templates])
        template_reports = []
        progress.scale(len(templates))
        for template in templates:
            template_report = self.find_template(
                template,
                threshold=threshold,
                distance_min=distance_min,
                frame_sampling=frame_sampling,
                file_keys=file_keys,
                progress=progress.subtask(1),
            )
            template_reports.append(template_report)
        progress.complete()
        return pd.concat(template_reports, ignore_index=True)

    def distance_from_min(self, data, thr=0.05):
        inds = np.where(np.diff(((data / data.min()) < (1 + thr))))
        if len(inds[0]) > 0:
            return np.split(data, inds[0])
        return [data]

    def find_template(
        self,
        template: Template,
        threshold=0.07,
        frame_sampling=1,
        distance_min=0.05,
        file_keys: Optional[Sequence[FileKey]] = None,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ) -> pd.DataFrame:
        """Find the given template matches in all available files."""
        _logger.info("Loaded query embeddings %s", template.features.shape)
        file_reports = []  # reports for individual files

        for file_key in self._searchable_files(template, file_keys, progress):
            try:
                excluded_time = self.black_list.excluded_time(template, file_key)
                found_matches = self.find_template_in_file(
                    file_key=file_key,
                    template=template,
                    threshold=threshold,
                    frame_sampling=frame_sampling,
                    distance_min=distance_min,
                    excluded_time=excluded_time,
                )
                file_reports.append(found_matches)
            except Exception:
                _logger.exception("Error occurred while matching template %s", template.name)
        return pd.concat(file_reports, ignore_index=True)

    def find_template_in_file(
        self,
        file_key: FileKey,
        template: Template,
        threshold=0.07,
        frame_sampling=1,
        distance_min=0.05,
        excluded_time: Cover = None,
    ) -> pd.DataFrame:
        """Find template matches in a single file."""
        excluded_time = excluded_time or Cover()
        template_features = template.features
        frame_features = self._frame_features.read(file_key)

        distances = np.mean(cdist(template_features, frame_features, metric="cosine"), axis=0)

        if len(distances) > 0 and np.min(distances) <= threshold:
            local_min_idx = np.argmin(distances)
            local_min = distances[local_min_idx]
            seqs = self.distance_from_min(distances, thr=distance_min)
            sequence_matches = []

            start = 0
            end = 0
            for idx, i in enumerate(seqs):
                seq_len = len(i)
                if seq_len:
                    if idx > 0:
                        start = end
                    end = start + seq_len

                    tseq = np.min(i) < (local_min * (1 + distance_min))
                    start_ms = self._time(frame=start, sampling=frame_sampling)
                    end_ms = self._time(frame=end, sampling=frame_sampling)
                    min_distance_ms = self._time(frame=local_min_idx, sampling=frame_sampling)

                    if tseq and not excluded_time.overlaps(start_ms, end_ms):
                        sequence_matches.append(
                            [
                                file_key.path,
                                file_key.hash,
                                template.name,
                                start_ms,
                                end_ms,
                                np.mean(i),
                                local_min,
                                min_distance_ms,
                            ]
                        )

            return pd.DataFrame(sequence_matches, columns=self.report_columns)

        # Return empty report otherwise
        return pd.DataFrame(columns=self.report_columns)

    def _searchable_files(
        self,
        template: Template,
        file_keys: Optional[Sequence[FileKey]] = None,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ) -> Iterator[FileKey]:
        """File keys available for template matching."""
        if file_keys is None:
            file_keys = self._frame_features.list()
            file_key_count = len(self._frame_features)
        else:
            file_key_count = len(file_keys)
        progress.scale(file_key_count)

        excluded_files = self.black_list.excluded_files(template)
        for file_key in file_keys:
            # Skip files excluded from the template scope
            if (file_key.path, file_key.hash) not in excluded_files:
                yield file_key
            progress.increase(1)
        progress.complete()

    def _time(self, frame, sampling):
        """Convert frame number to time in milliseconds."""
        return frame * sampling * 1000


def download_sample_templates(templates_path, url="https://s3.amazonaws.com/winnowpretrainedmodels/templates.tar.gz"):
    if os.path.exists(templates_path):
        _logger.info("Templates Found", glob(templates_path + "/**"))
    else:
        try:
            os.makedirs(templates_path)
        except Exception:
            _logger.exception("Error creating directory %s", templates_path)
        _logger.info("Downloading sample templates to: %s", templates_path)
        destination = templates_path + "/templates.tar.gz"
        download_file(destination, url)
        # unzip files
        shutil.unpack_archive(destination, format="gztar")
        # Delete tar
        os.unlink(destination)
