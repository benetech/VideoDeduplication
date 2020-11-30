import logging
import os
import sys

import click

from db import Database
from winnow.feature_extraction import (
    IntermediateCnnExtractor,
    FrameToVideoRepresentation,
    SimilarityModel,
    load_featurizer,
)
from winnow.feature_extraction.model import default_model_path
from winnow.storage.db_result_storage import DBResultStorage
from winnow.storage.repr_storage import ReprStorage
from winnow.storage.repr_utils import bulk_read, bulk_write
from winnow.utils import reprkey_resolver
from winnow.utils.files import scan_videos, scan_videos_from_txt, create_video_list
from winnow.utils.config import resolve_config

logging.getLogger().setLevel(logging.ERROR)
logging.getLogger("winnow").setLevel(logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))


@click.command()
@click.option("--config", "-cp", help="path to the project config file", default=os.environ.get("WINNOW_CONFIG"))
@click.option(
    "--list-of-files",
    "-lof",
    help="path to txt with a list of files for processing - overrides source folder from the config file",
    default="",
)
@click.option(
    "--frame-sampling",
    "-fs",
    help="Sets the sampling strategy (values from 1 to 10 - eg sample one frame every X seconds) - overrides frame sampling from the config file",
    default="",
)
@click.option(
    "--save-frames",
    "-sf",
    help="Whether to save the frames sampled from the videos - overrides save_frames on the config file",
    default=False,
    is_flag=True,
)
def main(config, list_of_files, frame_sampling, save_frames):
    config = resolve_config(config_path=config, frame_sampling=frame_sampling, save_frames=save_frames)

    reps = ReprStorage(os.path.join(config.repr.directory))
    reprkey = reprkey_resolver(config)

    print("Searching for Dataset Video Files")

    if len(list_of_files) == 0:
        videos = scan_videos(config.sources.root, "**", extensions=config.sources.extensions)
    else:
        videos = scan_videos_from_txt(list_of_files, extensions=config.sources.extensions)

    print("Number of files found: {}".format(len(videos)))

    remaining_videos_path = [path for path in videos if not reps.frame_level.exists(reprkey(path))]

    print("There are {} videos left".format(len(remaining_videos_path)))

    VIDEOS_LIST = create_video_list(remaining_videos_path, config.proc.video_list_filename)

    print("Processed video List saved on :{}".format(VIDEOS_LIST))

    if len(remaining_videos_path) > 0:
        # Instantiates the extractor
        model_path = default_model_path(config.proc.pretrained_model_local_path)
        extractor = IntermediateCnnExtractor(
            video_src=VIDEOS_LIST,
            reprs=reps,
            reprkey=reprkey,
            frame_sampling=config.proc.frame_sampling,
            save_frames=config.proc.save_frames,
            model=(load_featurizer(model_path)),
        )
        # Starts Extracting Frame Level Features
        extractor.start(batch_size=16, cores=4)

    print("Converting Frame by Frame representations to Video Representations")

    converter = FrameToVideoRepresentation(reps)

    converter.start()

    print("Extracting Signatures from Video representations")

    sm = SimilarityModel()

    vid_level_iterator = bulk_read(reps.video_level)

    assert len(vid_level_iterator) > 0, "No Signatures left to be processed"

    signatures = sm.predict(vid_level_iterator)  # Get {ReprKey => signature} dict

    print("Saving Video Signatures on :{}".format(reps.signature.directory))

    if config.database.use:
        # Convert dict to list of (path, sha256, signature) tuples
        entries = [(key.path, key.hash, sig) for key, sig in signatures.items()]

        # Connect to database
        database = Database(uri=config.database.uri)
        database.create_tables()

        # Save signatures
        result_storage = DBResultStorage(database)
        result_storage.add_signatures(entries)

    if config.save_files:
        bulk_write(reps.signature, signatures)


if __name__ == "__main__":
    main()
