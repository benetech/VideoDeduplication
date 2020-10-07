import logging
import shlex
import subprocess
from collections import defaultdict
import pandas as pd
from pandas.io.json import json_normalize
import cv2
import os 
import numpy as np
logger = logging.getLogger(__name__)

def findVideoMetada_mediainfo(pathToInputVideo):
    """Assumes the mediainfo cli is installed and runs it on the input video

    Args:
        pathToInputVideo ([String]): Path to input video

    Returns:
        [String]: Text output from runnning the mediainfo command
    """

    cmd = "mediainfo -f --Language=raw {}".format(pathToInputVideo)
    args = shlex.split(cmd)
    mediaInfo_output = subprocess.check_output(args).decode('utf-8')
    
    return mediaInfo_output

def process_media_info(info):
    
    lines = info.split('\n')
    section = None
    metadata = defaultdict(dict)
    
    for line in lines:
        
        if ':' not in line:
            section = line
        else:
            key,val,*_ = line.split(':')
            section,key = section.strip(), key.strip()
            metadata[section][key] = val
    
    return dict(metadata)


def get_duration(fp):
    
    cap = cv2.VideoCapture(fp)
    fps = max(0,cap.get(cv2.CAP_PROP_FPS))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if fps == 0:
        fps = 25
        
    duration = frame_count/fps
    
    if duration < 0:
        count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if isinstance(frame, np.ndarray):
                try:
                    if int(count % round(fps)) == 0:
                        count += 1
                except:
                    pass
            else:
                break
        
        duration = count / fps
            


    cap.release()
    
    return duration * 1000

def normalize_duration(metadata,file_path):

    if 'Duration' not in metadata['General'] or int(metadata['General']['Duration']) < 0:

        duration = get_duration(file_path)
        metadata['General']['Duration'] = duration
    
    return metadata


def extract_from_list_of_videos(video_files):
    """ Processes a list of video files and returns a list of dicts containing the mediainfo output for each file

    Args:
        video_files ([List[Strings]]): List of file paths to video files
    """

    video_metadata = []
    for file_path in video_files:

        try:
            raw_metadata = findVideoMetada_mediainfo(file_path)
            metadata = process_media_info(raw_metadata)
            metadata = normalize_duration(metadata,file_path)
            video_metadata.append(metadata)
        except Exception as exc:
            print("Problems processing file '%s': %s", file_path, exc)
            logging.error("Problems processing file '%s': %s", file_path, exc)
            video_metadata.append({"General":{"FileName":os.path.basename(file_path)}})

    return video_metadata

def convert_to_df(video_metadata):

    df = json_normalize(video_metadata)
    df.columns = [x.strip().replace('.','_').replace('(s)','s') for x in df.columns]

    return df

COLUMNS_OF_INTEREST = ['General_FileName',
       'General_FileExtension',
       'General_Format_Commercial',
       'General_FileSize',
       'General_Duration',
       'General_OverallBitRate_Mode',
       'General_OverallBitRate',
       'General_FrameRate',
       'General_FrameCount',
       'General_Encoded_Date',
       'General_File_Modified_Date',
       'General_File_Modified_Date_Local',
       'General_Tagged_Date',
       'Video_Format',
       'Video_BitRate',
       'Video_InternetMediaType',
       'Video_Width',
       'Video_Height',
       'Video_FrameRate',
       'Audio_Format',
       'Audio_SamplingRate',
       'Audio_Title',
       'Audio_BitRate',
       'Audio_Channels',
       'Audio_Duration',
       'Audio_Encoded_Date',
       'Audio_Tagged_Date']


NUMERICAL_COLS_OF_INTEREST = [
       'General_FileSize',
       'General_Duration',
       'General_OverallBitRate',
       'General_FrameRate',
       'General_FrameCount',
       'Video_BitRate',
       'Video_Width',
       'Video_Height',
       'Video_FrameRate',
       'Audio_SamplingRate',
       'Audio_BitRate',
       'Audio_Channels',
       'Audio_Duration']



def parse_and_filter_metadata_df(metadata_df):

    GROUP_COLUMNS_OF_INTEREST = [x for x in COLUMNS_OF_INTEREST if x in metadata_df.columns]
    GROUP_NUMERICAL_COLS_OF_INTEREST = [x for x in NUMERICAL_COLS_OF_INTEREST if x in metadata_df.columns]
    GROUP_STRING_COLS_OF_INTEREST = [x for x in GROUP_COLUMNS_OF_INTEREST if x not in GROUP_NUMERICAL_COLS_OF_INTEREST]

    filtered = metadata_df.loc[:,GROUP_COLUMNS_OF_INTEREST]

    # Parsing numerical fields
    filtered.loc[:,GROUP_NUMERICAL_COLS_OF_INTEREST] = filtered.loc[:,GROUP_NUMERICAL_COLS_OF_INTEREST].apply(lambda x: pd.to_numeric(x,errors='coerce'))
    filtered.loc[:,GROUP_STRING_COLS_OF_INTEREST] = filtered.loc[:,GROUP_STRING_COLS_OF_INTEREST].fillna('N/A').apply(lambda x:x.str.strip())
    
    return filtered
    

    

