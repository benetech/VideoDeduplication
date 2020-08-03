import os
os.environ['WINNOW_CONFIG'] = os.path.abspath('config.yaml')
from glob import glob
import numpy as np
from winnow.feature_extraction import IntermediateCnnExtractor,frameToVideoRepresentation,SimilarityModel
from winnow.utils import create_directory,scan_videos,get_original_fn_from_artifact,create_video_list
import yaml
import pytest
import warnings
import shutil
from pathlib import Path

NUMBER_OF_TEST_VIDEOS = 40

representations = ['frame_level','video_level','video_signatures']

with open("tests/config.yaml", 'r') as ymlfile:
    cfg = yaml.safe_load(ymlfile)

# Load main config variables from the TEST config file

DATASET_DIR = cfg['video_source_folder']
DST_DIR = cfg['destination_folder']
VIDEO_LIST_TXT = cfg['video_list_filename']
ROOT_FOLDER_INTERMEDIATE_REPRESENTATION =cfg['root_folder_intermediate']
USE_DB = cfg['use_db'] 
CONNINFO = cfg['conninfo']
KEEP_FILES = cfg['keep_fileoutput']
FRAME_LEVEL_SAVE_FOLDER = os.path.abspath(DST_DIR + '{}/{}'.format(ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[0]))
VIDEO_SIGNATURES_FILENAME = 'video_signatures'
FRAME_LEVEL_SAVE_FOLDER = os.path.join(DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[0])    
VIDEO_LEVEL_SAVE_FOLDER = os.path.join(DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[1])
VIDEO_SIGNATURES_SAVE_FOLDER = os.path.join(DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[2])
VIDEO_SIGNATURES_FILENAME = 'video_signatures.npy'
HANDLE_DARK = str(cfg['filter_dark_videos'])
DETECT_SCENES = str(cfg['detect_scenes'])
MIN_VIDEO_DURATION = cfg['min_video_duration_seconds']
DISTANCE = float(cfg['match_distance'])
KEEP_FILES = cfg['keep_fileoutput'] 
# Ensures that the config file follows specs

# Ensure we do not have processed files from previous test runs
try:

    shutil.rmtree('tests/test_data/test_output/representations/')
except:
    pass


def test_config_input():
    assert type(DATASET_DIR) == str, 'video_source_folder takes a string as a parameter'
    assert type(DST_DIR) == str, 'destination_folder takes a string as a parameter'
    assert type(ROOT_FOLDER_INTERMEDIATE_REPRESENTATION) == str, 'root_folder_intermediate takes a string as a parameter'
    assert type(USE_DB) == bool, 'use_db takes a boolean as a parameter'
    assert type(CONNINFO) == str, 'use_db takes a boolean as a parameter'
    
# additional tests for the inner string structure


# Ensures that config specifications are translated into the right file structure

create_directory(representations,DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION)


frame_level_folder = os.path.join(DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[0])
video_level_folder = os.path.join(DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[1])
video_signatures_folder = os.path.join(DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[2])

supported_video_extensions = ['.mp4','.ogv','.webm','.avi']

videos = scan_videos(DATASET_DIR,'**',extensions= supported_video_extensions)
processed_videos = scan_videos(FRAME_LEVEL_SAVE_FOLDER,'**_vgg_features.npy')

processed_filenames = get_original_fn_from_artifact(processed_videos,'_vgg_features')
full_video_names = [os.path.basename(x) for x in videos]
remaining_videos = [i for i,x in enumerate(full_video_names) if x not in processed_filenames]
remaining_videos_path = np.array(videos)[remaining_videos]
 
VIDEOS_LIST = create_video_list(remaining_videos_path,VIDEO_LIST_TXT)
video_files_count = len(open(VIDEOS_LIST).readlines())


extractor = IntermediateCnnExtractor(VIDEOS_LIST,FRAME_LEVEL_SAVE_FOLDER)
extractor.start(batch_size=16, cores=4)
processed_videos_after_extraction = scan_videos(FRAME_LEVEL_SAVE_FOLDER,'**_vgg_features.npy')
processed_videos_features = np.array([np.load(x) for x in processed_videos_after_extraction if 'vgg_features' in x])


converter = frameToVideoRepresentation(FRAME_LEVEL_SAVE_FOLDER,VIDEO_LEVEL_SAVE_FOLDER)
converter.start()
processed_videos_vl = scan_videos(VIDEO_LEVEL_SAVE_FOLDER,'**_vgg_features.npy')
processed_videos_features_vl = np.array([np.load(x) for x in processed_videos_vl if 'vgg_features' in x])

sm = SimilarityModel()
video_signatures = sm.predict(VIDEO_LEVEL_SAVE_FOLDER)
video_signatures = np.nan_to_num(video_signatures)

SIGNATURES_FILEPATH = os.path.join(VIDEO_SIGNATURES_SAVE_FOLDER,'{}.npy'.format(VIDEO_SIGNATURES_FILENAME))
SIGNATURES_INDEX_FILEPATH = os.path.join(VIDEO_SIGNATURES_SAVE_FOLDER,'{}-filenames.npy'.format(VIDEO_SIGNATURES_FILENAME))
np.save(SIGNATURES_FILEPATH,video_signatures)
np.save(SIGNATURES_INDEX_FILEPATH,sm.original_filenames)


def test_directory_structure():
    
    assert os.path.exists(frame_level_folder)
    assert os.path.exists(video_level_folder)
    assert os.path.exists(video_signatures_folder)


def test_videos_can_be_scanned():

    assert len(videos) == NUMBER_OF_TEST_VIDEOS
    assert len(processed_videos) == 0



def test_video_filenames_can_be_extracted():

    assert len(full_video_names) == NUMBER_OF_TEST_VIDEOS
    assert len(remaining_videos) == NUMBER_OF_TEST_VIDEOS

def test_video_extension_filter():

    not_video = [x for x in full_video_names if Path(x).suffix not in supported_video_extensions]

    assert len(not_video) == 0

def test_directory_with_multiple_levels():

    nested_files = ['0f607171f4f9403ab0f800b39f86f8a6.webm','0f3404af257e4ec7a648b740a8f67755.mp4']
    found = [x for x in nested_files if x in full_video_names]
    assert len(found) == len(nested_files)

def test_video_extension_filter_no_extensions_given():

    videos = scan_videos(DATASET_DIR,'**')
    full_video_names = [os.path.basename(x) for x in videos]
    not_video = [x for x in full_video_names if Path(x).suffix not in supported_video_extensions]
    
    assert len(not_video) > 0


def test_video_list_creation():

    assert video_files_count == NUMBER_OF_TEST_VIDEOS


def test_intermediate_cnn_extractor():

    shapes_correct = [x.shape[1] for x in processed_videos_features if x.shape[1] == 4096]

    assert len(processed_videos_after_extraction) == NUMBER_OF_TEST_VIDEOS
    assert len(shapes_correct) == NUMBER_OF_TEST_VIDEOS


def test_frame_to_video_converter():

    assert processed_videos_features_vl.shape == (NUMBER_OF_TEST_VIDEOS,1, 4096)

def test_signatures_shape():

    assert video_signatures.shape == (NUMBER_OF_TEST_VIDEOS,500)

def test_signatures_fp():

    vs = np.load(SIGNATURES_FILEPATH)

    assert vs.shape == (NUMBER_OF_TEST_VIDEOS, 500)


    













    










