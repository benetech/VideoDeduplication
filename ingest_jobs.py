"""
The standard extract features will generate 4 main files as an output

    1. video_signatures (Numpy file containing video signatures)
    2. video_signatures-filenames (Numpy file containing the filename index of the generated video signatures)
    3. Video Metadata (general information about each video)
    4. Scene Data (Output of our scene detection algorithm)

This script can be used to do a one off migration from those files into a database

"""

from db import *
from db.schema import *

# Target DB CONNINFO
CONN_STRING = "postgres://postgres:admin@localhost:5432/test"
# Source OUTPUT files


SIGNATURES_FP = "data/representations/video_signatures/video_signatures.npy"
SIGNATURES_FILENAME_FP = "data/representations/video_signatures/video_signatures-filenames.npy"
METADATA_FP = "data/metadata_signatures.csv"
SCENE_FP =  "scene_metadata.csv"



db_engine,session = create_engine_session(CONN_STRING)


# Create tables (assuming these tables haven't been created already)
create_tables(db_engine)

# Load each Output type into DB

load_signatures(session,SIGNATURES_FP,SIGNATURES_FILENAME_FP)
load_metadata(session,METADATA_FP)
load_scenes(session,SCENE_FP)


try:
    session.commit()
    
except:
    session.rollback()
    print('DB Exception')
    # raise

finally:
    # Get DB stats
    signatures = get_all(session,Signature)
    video_metadata = get_all(session,VideoMetadata)
    scenes = get_all(session,Scenes)
    print(f"Signatures table rows:{len(signatures)}")
    print(f"Video metatada rows:{len(video_metadata)}")
    print(f"Scenes table rows:{len(scenes)}")

    session.close()
