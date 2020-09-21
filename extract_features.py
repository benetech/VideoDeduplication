import numpy as np
import os

from db import Database

os.environ['WINNOW_CONFIG'] = os.path.abspath('config.yaml')
import click
from glob import glob
from winnow.feature_extraction import IntermediateCnnExtractor,frameToVideoRepresentation,SimilarityModel
from winnow.utils import create_directory,scan_videos,create_video_list,get_original_fn_from_artifact,scan_videos_from_txt
from db.utils import *
from db.schema import *
import yaml
import sys
from winnow.storage.db_result_storage import DBResultStorage


def signature_entries(processed_paths, video_signatures, dataset_dir):
    """Get list of (path,sha256,sig) tuples for the given processing results."""

    # chop root folder path from processed path
    relative_paths = [os.path.relpath(path, dataset_dir) for path in processed_paths]

    # get (path, sha256, signature) list
    return list(zip(
        relative_paths,
        map(get_hash, processed_paths),
        video_signatures
    ))

@click.command()
@click.option(
    '--config', '-cp',
    help='path to the project config file',
    default=os.environ['WINNOW_CONFIG'])

@click.option(
    '--list-of-files', '-lof',
    help='path to txt with a list of files for processing - overrides source folder from the config file',
    default="")


def main(config,list_of_files):

    representations = ['frame_level','video_level','video_signatures']

    with open(config, 'r') as ymlfile:
        cfg = yaml.load(ymlfile)

    DATASET_DIR = cfg['video_source_folder']
    DST_DIR = cfg['destination_folder']
    VIDEO_LIST_TXT = cfg['video_list_filename']
    ROOT_FOLDER_INTERMEDIATE_REPRESENTATION =cfg['root_folder_intermediate']
    USE_DB = cfg['use_db']
    CONNINFO = cfg['conninfo']
    USE_FILES = cfg['keep_fileoutput'] or not USE_DB
    FRAME_LEVEL_SAVE_FOLDER = os.path.join(DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[0])
    VIDEO_LEVEL_SAVE_FOLDER = os.path.join(DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[1])
    VIDEO_SIGNATURES_SAVE_FOLDER = os.path.join(DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[2])
    VIDEO_SIGNATURES_FILENAME = 'video_signatures.npy'
    

    print('Creating Intermediate Representations folder on :{}'.format(os.path.abspath(DST_DIR)))

    create_directory(representations,DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION)
    
    print('Searching for Dataset Video Files')

    if len(list_of_files) == 0:

        videos = scan_videos(DATASET_DIR,'**',extensions=['.mp4','.ogv','.webm','.avi'])

    else:

        videos = scan_videos_from_txt(list_of_files,extensions=['.mp4','.ogv','.webm','.avi'])

    print('Number of files found: {}'.format(len(videos)))

    processed_videos = scan_videos(FRAME_LEVEL_SAVE_FOLDER,'**_vgg_features.npy')

    print('Found {} videos that have already been processed.'.format(len(processed_videos)))

    processed_filenames = get_original_fn_from_artifact(processed_videos,'_vgg_features')
    full_video_names = [os.path.basename(x) for x in videos]

    # Check for remaining videos
    remaining_videos = [i for i,x in enumerate(full_video_names) if x not in processed_filenames]

    remaining_videos_path = np.array(videos)[remaining_videos]

    base_to_path = dict({os.path.basename(x):os.path.relpath(x) for x in videos})

    print('There are {} videos left'.format(len(remaining_videos_path)))

    VIDEOS_LIST = create_video_list(remaining_videos_path,VIDEO_LIST_TXT)

    print('Processed video List saved on :{}'.format(VIDEOS_LIST))

    if len(remaining_videos_path) > 0:
        # Instantiates the extractor
        extractor = IntermediateCnnExtractor(VIDEOS_LIST,FRAME_LEVEL_SAVE_FOLDER)
        # Starts Extracting Frame Level Features
        extractor.start(batch_size=16,cores=4)

    print('Converting Frame by Frame representations to Video Representations')

    converter = frameToVideoRepresentation(FRAME_LEVEL_SAVE_FOLDER,VIDEO_LEVEL_SAVE_FOLDER)

    converter.start()

    print('Extracting Signatures from Video representations')

    sm = SimilarityModel()
    video_signatures = sm.predict(VIDEO_LEVEL_SAVE_FOLDER)

    video_signatures = np.nan_to_num(video_signatures)

    print('Saving Video Signatures on :{}'.format(VIDEO_SIGNATURES_SAVE_FOLDER))

    # We need to be extra careful about keeping track of filenames / paths as move through the pipeline
    
    processed_paths = [base_to_path[x] for x in sm.original_filenames]


    if USE_DB:
        # get list of (path, sha256, signature) tuples
        entries = signature_entries(processed_paths, video_signatures, DATASET_DIR)

        # Save signatures
        result_storage = DBResultStorage(Database(uri=CONNINFO))
        result_storage.add_signatures(entries)

    if USE_FILES:
        np.save(os.path.join(VIDEO_SIGNATURES_SAVE_FOLDER,'{}.npy'.format(VIDEO_SIGNATURES_FILENAME)),video_signatures)
        np.save(os.path.join(VIDEO_SIGNATURES_SAVE_FOLDER,'{}-filenames.npy'.format(VIDEO_SIGNATURES_FILENAME)),sm.original_filenames)
        print('Signatures of shape {} saved on :{}'.format(video_signatures.shape,VIDEO_SIGNATURES_SAVE_FOLDER))





if __name__ == '__main__':

    main()

    

