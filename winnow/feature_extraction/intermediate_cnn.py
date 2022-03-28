from typing import Collection, Any, Optional

from .extraction_routine import feature_extraction_videos, load_featurizer, OnExtractedCallback
from .model import default_model_path
from .model_tf import CNN_tf
from ..utils.multiproc import multiprocessing as mp


class IntermediateCnnExtractor:
    def __init__(
        self,
        video_paths: Collection[str],
        on_extracted: OnExtractedCallback,
        video_ids: Collection[Any] = None,
        frame_sampling: int = 1,
        model: Optional[CNN_tf] = None,
    ):
        """
        Args:
            video_paths: collection of video file paths
            on_extracted: callback to be invoked when the corresponding
                features are extracted: `on_extracted(path, frame, features)`
            video_ids: optional collection of the same size as `video_paths`. If provided, the corresponding ids
                will be used instead of
            frame_sampling:
            model: pretrained model
        """
        self._video_paths = video_paths
        self._frame_sampling = frame_sampling
        self._model = model
        self._on_extracted = on_extracted
        self._video_ids = video_ids or video_paths

    def extract_features(self, batch_size: int = 8, cores: int = None):
        self._model = self._model or load_featurizer(default_model_path())
        feature_extraction_videos(
            model=self._model,
            video_paths=self._video_paths,
            video_ids=self._video_ids,
            on_extracted=self._on_extracted,
            batch_sz=batch_size,
            cores=cores or mp.cpu_count(),
            frame_sampling=self._frame_sampling,
        )
