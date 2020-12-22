import logging
import os

from db import Database
from winnow.config import Config
from winnow.feature_extraction import (
    IntermediateCnnExtractor,
    FrameToVideoRepresentation,
    SimilarityModel,
    load_featurizer,
)
from winnow.feature_extraction.model import default_model_path
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.storage.db_result_storage import DBResultStorage
from winnow.storage.repr_storage import ReprStorage
from winnow.storage.repr_utils import bulk_read, bulk_write
from winnow.utils.files import create_video_list
from winnow.utils.repr import reprkey_resolver


def extract_features(config: Config, videos: list, progress_monitor=ProgressMonitor.NULL):
    """Extract features from the dataset videos."""

    logger = logging.getLogger(__name__)
    reps = ReprStorage(os.path.join(config.repr.directory))
    reprkey = reprkey_resolver(config)

    logger.info("Number of files: {}".format(len(videos)))

    remaining_videos_path = [path for path in videos if not reps.frame_level.exists(reprkey(path))]

    logger.info("There are {} videos left".format(len(remaining_videos_path)))

    VIDEOS_LIST = create_video_list(remaining_videos_path, config.proc.video_list_filename)

    logger.info("Processed video List saved on :{}".format(VIDEOS_LIST))

    if len(remaining_videos_path) > 0:
        # Instantiates the extractor
        model_path = default_model_path(config.proc.pretrained_model_local_path)
        extractor = IntermediateCnnExtractor(
            video_src=VIDEOS_LIST,
            reprs=reps,
            reprkey=reprkey,
            frame_sampling=config.proc.frame_sampling,
            save_frames=config.proc.save_frames,
            model=load_featurizer(model_path),
        )
        # Starts Extracting Frame Level Features
        extractor.start(
            batch_size=16,
            cores=4,
            progress_monitor=progress_monitor.subtask(work_amount=0.8),
        )

    logger.info("Converting Frame by Frame representations to Video Representations")

    converter = FrameToVideoRepresentation(reps)

    converter.start(progress_monitor=progress_monitor.subtask(work_amount=0.05))

    logger.info("Extracting Signatures from Video representations")

    sm = SimilarityModel()

    vid_level_iterator = bulk_read(reps.video_level)

    assert len(vid_level_iterator) > 0, "No Signatures left to be processed"

    signatures = sm.predict(vid_level_iterator)  # Get {ReprKey => signature} dict

    progress_monitor.increase(amount=0.1)

    logger.info("Saving Video Signatures on :{}".format(reps.signature.directory))

    if config.database.use:
        # Convert dict to list of (path, sha256, signature) tuples
        entries = [(key.path, key.hash, sig) for key, sig in signatures.items()]

        # Connect to database
        database = Database(uri=config.database.uri)
        database.create_tables()

        # Save signatures
        result_storage = DBResultStorage(database)
        result_storage.add_signatures(entries)

    bulk_write(reps.signature, signatures)
