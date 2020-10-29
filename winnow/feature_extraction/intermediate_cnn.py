from .extraction_routine import feature_extraction_videos, load_featurizer
from .model import default_model_path


class IntermediateCnnExtractor:

    def __init__(
                 self,
                 video_src,
                 reprs,
                 reprkey,
                 frame_sampling=1,
                 save_frames=False,
                 model=None):

        self.video_src = video_src
        self.reprs = reprs
        self.reprkey = reprkey
        self.frame_sampling = frame_sampling
        self.save_frames = save_frames
        self.model = model

    def start(self, batch_size=8, cores=4):
        print('Starting feature extraction process: {}'.format(self.video_src))
        self.model = self.model or load_featurizer(default_model_path())
        feature_extraction_videos(
            model=self.model,
            video_list=self.video_src,
            reprs=self.reprs,
            reprkey=self.reprkey,
            batch_sz=batch_size,
            cores=cores,
            frame_sampling=self.frame_sampling,
            save_frames=self.save_frames)
