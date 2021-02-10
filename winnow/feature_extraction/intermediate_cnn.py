from typing import Callable

from .extraction_routine import feature_extraction_videos, load_featurizer
from .model import default_model_path


class IntermediateCnnExtractor:
    def __init__(self, videos, on_extracted: Callable, frame_sampling=1, model=None):
        self.videos = videos
        self.frame_sampling = frame_sampling
        self.model = model
        self.on_extracted = on_extracted

    def extract_features(self, batch_size=8, cores=4):
        self.model = self.model or load_featurizer(default_model_path())
        feature_extraction_videos(
            model=self.model,
            videos=self.videos,
            on_extracted=self.on_extracted,
            batch_sz=batch_size,
            cores=cores,
            frame_sampling=self.frame_sampling,
        )
