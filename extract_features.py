import numpy as np
import os
from glob import glob
from winnow.feature_extraction import IntermediateCnnExtractor,frameToVideoRepresentation,SimilarityModel

import yaml
with open("config.yaml", 'r') as ymlfile:
    cfg = yaml.load(ymlfile)


# SOURCE Directory

DATASET_DIR = cfg['video_source_folder']
DST_DIR = cfg['destination_folder']
VIDEO_LIST_TXT = cfg['video_list_filename']
ROOT_FOLDER_INTERMEDIATE_REPRESENTATION =cfg['root_folder_intermediate']

print('Searching for Dataset Video Files')

videos = glob(DATASET_DIR + '**')

print('Number of files found: {}'.format(len(videos)))

with open(VIDEO_LIST_TXT, 'w') as f:
    for item in videos:
        f.write("%s\n" % item)
        
VIDEOS_LIST = os.path.abspath(VIDEO_LIST_TXT)

print('Video List saved on :{}'.format(VIDEOS_LIST))

representations = ['frame_level','video_level','video_signatures']


FRAME_LEVEL_SAVE_FOLDER = os.path.abspath(DST_DIR + '{}/{}'.format(ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[0]))
VIDEO_LEVEL_SAVE_FOLDER = DST_DIR + '{}/{}'.format(ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[1])
VIDEO_SIGNATURES_SAVE_FOLDER = DST_DIR + '{}/{}'.format(ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,representations[2])
VIDEO_SIGNATURES_FILENAME = 'video_signatures.npy'

print('Creating Intermediate Representations folder on :{}'.format(DST_DIR))

for r in representations:
    try:
        os.makedirs(DST_DIR + '{}/{}'.format(ROOT_FOLDER_INTERMEDIATE_REPRESENTATION,r))
    except Exception as e:
        print(e)

    
# Instantiates the extractor
extractor = IntermediateCnnExtractor(VIDEOS_LIST,FRAME_LEVEL_SAVE_FOLDER)
# Starts Extracting Frame Level Features
extractor.start(batch_size=64,cores=6)



print('Converting Frame by Frame representatinos to Video Representations')

converter = frameToVideoRepresentation(FRAME_LEVEL_SAVE_FOLDER,VIDEO_LEVEL_SAVE_FOLDER)

converter.start()


print('Extracting Signatures from Video representations')


sm = SimilarityModel()
video_signatures = sm.predict(VIDEO_LEVEL_SAVE_FOLDER)

video_signatures = np.nan_to_num(video_signatures)

print('Saving Video Signatures on :{}'.format(VIDEO_SIGNATURES_SAVE_FOLDER))

np.save(os.path.join(VIDEO_SIGNATURES_SAVE_FOLDER,VIDEO_SIGNATURES_FILENAME),video_signatures)

print('Signatures of shape {} saved on :{}'.format(video_signatures.shape,VIDEO_SIGNATURES_SAVE_FOLDER))

