import logging
import os
import sys

from db import Database
from winnow.storage.repr_storage import ReprStorage
from winnow.storage.repr_utils import bulk_read, bulk_write, path_resolver

os.environ['WINNOW_CONFIG'] = os.path.abspath('config.yaml')
import click
from winnow.feature_extraction import IntermediateCnnExtractor,FrameToVideoRepresentation,SimilarityModel
from winnow.utils import scan_videos, create_video_list, scan_videos_from_txt
from db.utils import *
import yaml
from winnow.storage.db_result_storage import DBResultStorage

logging.getLogger().setLevel(logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))



@click.command()
@click.option(
    '--config', '-cp',
    help='path to the project config file',
    default=os.environ['WINNOW_CONFIG'])

@click.option(
    '--list-of-files', '-lof',
    help='path to txt with a list of files for processing - overrides source folder from the config file',
    default="")

@click.option(
    '--frame-sampling', '-fs',
    help='Sets the sampling strategy (values from 1 to 10 - eg sample one frame every X seconds) - overrides frame sampling from the config file',
    default="")

@click.option(
    '--save-frames', '-sf',
    help='Whether to save the frames sampled from the videos - overrides save_frames on the config file',
    default=False,is_flag=True)



def main(config,list_of_files,frame_sampling,save_frames):

    with open(config, 'r') as ymlfile:
        cfg = yaml.load(ymlfile)

    DATASET_DIR = cfg['video_source_folder']
    DST_DIR = cfg['destination_folder']
    VIDEO_LIST_TXT = cfg['video_list_filename']
    ROOT_FOLDER_INTERMEDIATE_REPRESENTATION =cfg['root_folder_intermediate']
    FRAME_SAMPLING = int(frame_sampling or cfg['frame_sampling'])
    SAVE_FRAMES = bool(save_frames or cfg['save_frames'])
    USE_DB = cfg['use_db']
    CONNINFO = cfg['conninfo']
    USE_FILES = cfg['keep_fileoutput'] or not USE_DB

    reps = ReprStorage(os.path.join(DST_DIR, ROOT_FOLDER_INTERMEDIATE_REPRESENTATION))
    storepath = path_resolver(source_root=DATASET_DIR)

    print('Searching for Dataset Video Files')

    if len(list_of_files) == 0:
        videos = scan_videos(DATASET_DIR,'**',extensions=['.mp4','.ogv','.webm','.avi'])
    else:
        videos = scan_videos_from_txt(list_of_files,extensions=['.mp4','.ogv','.webm','.avi'])

    

    print('Number of files found: {}'.format(len(videos)))

    remaining_videos_path = [path for path in videos if not reps.frame_level.exists(storepath(path), get_hash(path))]

    print('There are {} videos left'.format(len(remaining_videos_path)))

    VIDEOS_LIST = create_video_list(remaining_videos_path,VIDEO_LIST_TXT)

    print('Processed video List saved on :{}'.format(VIDEOS_LIST))

    if len(remaining_videos_path) > 0:
        # Instantiates the extractor
        extractor = IntermediateCnnExtractor(VIDEOS_LIST, reps, storepath, frame_sampling=FRAME_SAMPLING, save_frames=SAVE_FRAMES)
        # Starts Extracting Frame Level Features
        extractor.start(batch_size=16, cores=4)

    print('Converting Frame by Frame representations to Video Representations')

    converter = FrameToVideoRepresentation(reps)

    converter.start()

    print('Extracting Signatures from Video representations')

    sm = SimilarityModel()
    signatures = sm.predict(bulk_read(reps.video_level))  # Get dict (path,hash) => signature

    print('Saving Video Signatures on :{}'.format(reps.signature.directory))

    if USE_DB:
        # Convert dict to list of (path, sha256, signature) tuples
        entries = [(path, sha256, sig) for (path, sha256), sig in signatures.items()]

        # Connect to database
        database = Database(uri=CONNINFO)
        database.create_tables()

        # Save signatures
        result_storage = DBResultStorage(database)
        result_storage.add_signatures(entries)

    if USE_FILES:
        bulk_write(reps.signature, signatures)


if __name__ == '__main__':
    main()
