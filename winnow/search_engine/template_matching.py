import logging
import os
import shutil
from glob import glob
from typing import List

import numpy as np
import pandas as pd
from scipy.spatial.distance import cdist

from winnow.search_engine.black_list import BlackList
from winnow.search_engine.model import Template
from winnow.storage.repr_storage import ReprStorage
from winnow.utils.network import download_file

_logger = logging.getLogger(__name__)


class SearchEngine:
    def __init__(
        self,
        reprs: ReprStorage,
        black_list: BlackList = None,
    ):
        self.reprs = reprs
        self.relevant_cols = [
            "path",
            "hash",
            "template_name",
            "start_ms",
            "end_ms",
            "mean_distance_sequence",
            "min_distance_video",
            "min_distance_ms",
        ]
        self.results_cache = pd.DataFrame(columns=self.relevant_cols)
        self.black_list = black_list or BlackList()

    def create_annotation_report(self, templates: List[Template], threshold=0.07, frame_sampling=1, distance_min=0.05):
        """Creates an annotation report suitable for annotation
        (using our own Annotator class)

        Returns:
            [pandas.DataFrame] -- Dataframe in the same format as the output
            from the "generate_matches.py" script
        """
        _logger.info("Searching for templates: %s", [template.name for template in templates])

        for template in templates:
            self.find(template, threshold=threshold, distance_min=distance_min, frame_sampling=frame_sampling)

        return self.results_cache

    def distance_from_min(self, data, thr=0.05):
        inds = np.where(np.diff(((data / data.min()) < (1 + thr))))
        if len(inds[0]) > 0:
            return np.split(data, inds[0])
        return [data]

    def find(  # noqa C901 TODO: Simplify method (https://github.com/benetech/VideoDeduplication/issues/378)
        self, template: Template, threshold=0.07, frame_sampling=1, distance_min=0.05
    ):
        template_features = template.features
        _logger.info("Loaded query embeddings %s", template_features.shape)
        # self.results_cache[query] = defaultdict()
        dfs = []
        excluded_files = self.black_list.excluded_files(template)
        for file_key in self.reprs.frame_level.list():
            # Skip files excluded from the template scope
            if (file_key.path, file_key.hash) in excluded_files:
                continue
            excluded_time = self.black_list.excluded_time(template, file_key)
            try:
                sample = self.reprs.frame_level.read(file_key)

                distances = np.mean(cdist(template_features, sample, metric="cosine"), axis=0)
                # np.save(f"dists{repr_key.path}_{query}.npy", distances)
                # self.results_cache[query][(repr_key.path, repr_key.hash)] = list()

                if len(distances) > 0:

                    local_min = np.min(distances)
                    local_min_idx = np.argmin(distances)

                    if local_min <= threshold:

                        seqs = self.distance_from_min(distances, thr=distance_min)
                        sequence_matches = []

                        start = 0
                        end = 0
                        for idx, i in enumerate(seqs):
                            #     print(i,a.shape)
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

                        dfs.append(pd.DataFrame(sequence_matches, columns=self.relevant_cols))

            except Exception:
                _logger.exception("Error occurred while matching template %s", template.name)

        self.results_cache = pd.concat([self.results_cache, *dfs], ignore_index=True)

    def _time(self, frame, sampling):
        """Convert frame number to time in milliseconds."""
        return frame * sampling * 1000


def download_sample_templates(TEMPLATES_PATH, URL="https://s3.amazonaws.com/winnowpretrainedmodels/templates.tar.gz"):

    if os.path.exists(TEMPLATES_PATH):
        _logger.info("Templates Found", glob(TEMPLATES_PATH + "/**"))

    else:
        try:
            os.makedirs(TEMPLATES_PATH)
        except Exception:
            _logger.exception("Error creating directory %s", TEMPLATES_PATH)
        _logger.info("Downloading sample templates to: %s", TEMPLATES_PATH)
        DST = TEMPLATES_PATH + "/templates.tar.gz"
        download_file(DST, URL)
        # unzip files
        shutil.unpack_archive(DST, format="gztar")
        # Delete tar
        os.unlink(DST)
