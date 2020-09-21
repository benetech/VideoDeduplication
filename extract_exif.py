import click
from glob import glob
import matplotlib.pyplot as plt
import numpy as np
import os
# os.environ['WINNOW_CONFIG'] = os.path.abspath('config.yaml')
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from tqdm import tqdm
from winnow.feature_extraction import SimilarityModel
from winnow.utils import extract_additional_info, extract_scenes,filter_results,uniq,scan_videos,extract_from_list_of_videos,convert_to_df,parse_and_filter_metadata_df
import cv2
import yaml
from db.utils import *
from db.schema import *


@click.command()
@click.option(
    '--config', '-cp',
    help='path to the project config file',
    default='config.yaml')


def main(config):

    print('Loading config file')

    with open(config, 'r') as ymlfile:
        cfg = yaml.load(ymlfile)


    representations = ['frame_level','video_level','video_signatures']
    
    DATASET_DIR = cfg['video_source_folder']
    DST_DIR = cfg['destination_folder']
    USE_DB = cfg['use_db'] 
    CONNINFO = cfg['conninfo']
    KEEP_FILES = cfg['keep_fileoutput'] 


    if USE_DB:

            db_engine,session = create_engine_session(CONNINFO)
            # Creates tables if not yet created (will only change DB if any operations are eventually performed)
            create_tables(db_engine)
            video_records = get_all(session,Files)
            videos = [x.file_path for x in video_records]
    else:

        videos = scan_videos(DATASET_DIR,'**',extensions=['.mp4','.ogv','.webm','.avi'])

    assert len(videos) > 0, 'No videos found'

    print(f'{len(videos)} videos found')

    metadata  = extract_from_list_of_videos(videos)

    df = convert_to_df(metadata)

    df_parsed = parse_and_filter_metadata_df(df)

    assert len(metadata) == len(df_parsed)

    

    if KEEP_FILES:

        EXIF_REPORT_PATH = os.path.join(DST_DIR,'exif_metadata.csv')

        df_parsed.to_csv(EXIF_REPORT_PATH)

        print(f"Exif Metadata report exported to:{EXIF_REPORT_PATH}")

    if USE_DB:

        df_parsed['file_id'] = [x.id for x in video_records]

        exif_rows = add_exif(session,df_parsed,metadata)
        
        print(f"Exif table rows:{len(exif_rows)}")


if __name__ == '__main__':

    main()    


