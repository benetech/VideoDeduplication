import click
import yaml
import os
import numpy as np
import yaml
from winnow.feature_extraction.loading_utils import global_vector_from_tensor
from winnow.feature_extraction.extraction_routine import load_featurizer
from winnow.feature_extraction import SimilarityModel
from winnow.feature_extraction.utils import download_pretrained,load_video
from db import *
from db.schema import *


@click.command()
@click.argument('path')
@click.argument('output',default='data/')
@click.option(
    '--config', '-cp',
    help='path to the project config file',
    default='config.yaml')

@click.option('--save-frames',is_flag=True)
@click.option('--save-features/--no-features',default=True)
@click.option('--save-signatures/--no-signatures',default=True)
@click.option('--save-db',is_flag=True)

def main(path,output,config,save_frames,save_features,save_signatures,save_db):
    """
    Application to extract features from a single video file
    """
    print(save_db)
    

    PRETRAINED_LOCAL_PATH = download_pretrained(config)
    video_name = os.path.basename(path)

    model = load_featurizer(PRETRAINED_LOCAL_PATH)
    video_tensor = load_video(path,model.desired_size)
    features = model.extract(video_tensor, 10)
    
    video_level_repres = global_vector_from_tensor(features)
    sm = SimilarityModel()
    sm.build_features_single(video_level_repres,video_name)
    video_signatures = sm.predict()

    video_signatures = np.nan_to_num(video_signatures)

    if save_frames:

        frame_path = os.path.join(output, '{}_{}_frames'.format(video_name, model.net_name))
        np.save(frame_path, video_tensor)
    
    if save_features:

        features_path = os.path.join(output, '{}_{}_features'.format(video_name, model.net_name))
        np.save(features_path, features)

    if save_signatures:        
        
        signatures_path = os.path.join(output, '{}_{}_signature'.format(video_name, model.net_name))
        np.save(signatures_path, video_signatures)
    
    if save_db:

        with open(config, 'r') as ymlfile:
            cfg = yaml.load(ymlfile)

        CONNINFO = cfg['conninfo']
        
        db_engine,session = create_engine_session(CONNINFO)
        create_tables(db_engine)
        #TODO Currently we have an automated incremental index set for the Signatures table (we might want to change it in the future so we don't add duplicated signatures)
        processed_paths = [os.path.relpath(path)]
        file_entries = add_files(session,processed_paths)

        # Extract ids from records in order to save signatures with the proper information
        processed_to_id = dict({x.file_path:x.id for x in file_entries})
        file_ids = [processed_to_id[x] for x in processed_paths]
        signatures = add_signatures(session,video_signatures,file_ids)
        



if __name__ == "__main__":
    main()