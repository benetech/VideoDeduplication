import numpy as np
import os

os.environ['WINNOW_CONFIG'] = os.path.abspath('config.yaml')

from glob import glob
from winnow.feature_extraction import IntermediateCnnExtractor,frameToVideoRepresentation,SimilarityModel
from winnow.utils import create_directory,scan_videos,create_video_list,get_original_fn_from_artifact
from db import *
from db.schema import *
import yaml


if __name__ == '__main__':

    representations = ['frame_level','video_level','video_signatures']

    with open("config.yaml", 'r') as ymlfile:
        cfg = yaml.load(ymlfile)

    DATASET_DIR = cfg['video_source_folder']
    DST_DIR = cfg['destination_folder']
    VIDEO_LIST_TXT = cfg['video_list_filename']
    ROOT_FOLDER_INTERMEDIATE_REPRESENTATION =cfg['root_folder_intermediate']
    USE_DB = cfg['use_db'] 
    CONNINFO = cfg['conninfo']
    KEEP_FILES = cfg['keep_fileoutput']
    FRAME_LEVEL_SAVE_FOLDER = os.path.abspath(DST_DIR + '{}/{}'.format(ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[0]))
    VIDEO_LEVEL_SAVE_FOLDER = DST_DIR + '{}/{}'.format(ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[1])
    VIDEO_SIGNATURES_FILENAME = 'video_signatures'
    FRAME_LEVEL_SAVE_FOLDER = os.path.join(DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[0])    
    VIDEO_LEVEL_SAVE_FOLDER = os.path.join(DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[1])
    VIDEO_SIGNATURES_SAVE_FOLDER = os.path.join(DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[2])
    VIDEO_SIGNATURES_FILENAME = 'video_signatures.npy'
    

    print('Creating Intermediate Representations folder on :{}'.format(os.path.abspath(DST_DIR)))

    create_directory(representations,DST_DIR,ROOT_FOLDER_INTERMEDIATE_REPRESENTATION)
    
    print('Searching for Dataset Video Files')

    videos = scan_videos(DATASET_DIR,'**')

    print('Number of files found: {}'.format(len(videos)))

    processed_videos = scan_videos(FRAME_LEVEL_SAVE_FOLDER,'**_vgg_features.npy')

    print('Found {} videos that have already been processed.'.format(len(processed_videos)))

    # Get filenames
    processed_filenames = get_original_fn_from_artifact(processed_videos,'_vgg_features')
    full_video_names = [os.path.basename(x) for x in videos]

    # Check for remaining videos
    remaining_videos = [i for i,x in enumerate(full_video_names) if x not in processed_filenames]

    remaining_videos_path = np.array(videos)[remaining_videos]

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

    if USE_DB:
        db_engine,session = create_engine_session(CONNINFO)
        create_tables(db_engine)
        add_signatures(session,video_signatures,sm.original_filenames)
        try:
            session.commit()
    
        except:
            session.rollback()
            print('DB Exception')
            # raise

        finally:
            # Get DB stats
            signatures = get_all(session,Signature)
            print(f"Signatures table rows:{len(signatures)}")

    if KEEP_FILES or USE_DB is False:

        np.save(os.path.join(VIDEO_SIGNATURES_SAVE_FOLDER,'{}.npy'.format(VIDEO_SIGNATURES_FILENAME)),video_signatures)
        np.save(os.path.join(VIDEO_SIGNATURES_SAVE_FOLDER,'{}-filenames.npy'.format(VIDEO_SIGNATURES_FILENAME)),sm.original_filenames)
        print('Signatures of shape {} saved on :{}'.format(video_signatures.shape,VIDEO_SIGNATURES_SAVE_FOLDER))

