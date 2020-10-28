import datetime
import os
import shutil
from collections import defaultdict
from glob import glob

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.spatial.distance import cdist

from winnow.feature_extraction.utils import load_image, download_file
from winnow.storage.repr_storage import ReprStorage


class SearchEngine:
    def __init__(self, templates_root, reprs: ReprStorage, model):

        templates_glob = os.path.join(templates_root,'*')

        self.templates_root = templates_glob
        self.model = model
        self.available_queries = self.find_available_templates()
        self.reprs = reprs
        self.template_cache = self.load_available_templates()
        self.results_cache = {}
        
        
    def find_available_templates(self):
    
        folders = glob(self.templates_root)
        available = dict(zip([x.split('/')[-1] for x in folders],folders))
        
        return available
    
    def load_templates(self,files):
        resized = np.array([load_image(x,224) for x in files])
        features = self.model.extract(resized,batch_sz=10)
        return features
    
    def load_available_templates(self):
        
        cache = dict()
        
        for k,v in self.available_queries.items():
            
            cache[k] = self.load_templates(glob(v + '/**'))
            
        return cache
        
    def create_annotation_report(self,threshold = 0.07,fp = 'template_test.csv',queries = None,frame_sampling = 1):

        """Creates an annotation report suitable for annotation (using our own Annotator class)
        
        Returns:
            [pandas.DataFrame] -- Dataframe in the same format as the output from the "generate_matches.py" script
        """

        def create_template_summary(files):
            resized = np.array([load_image(x,224) for x in files])
            return resized

        if queries is None:
            for q in self.available_queries:
                self.find(q,threshold=threshold,plot=False)
        else:
            for q in queries:
                self.find(q,threshold=threshold,plot=False)

        print(self.available_queries)

        if self.results_cache:
            
            records = pd.DataFrame.from_records(self.results_cache,index=None).reset_index()
            
            # Massage template matching results
            df = pd.melt(records,id_vars=['level_0','level_1'])
            msk = df['variable'] != 'Unnamed: 0'
            df = df.loc[msk,:]
            # Convert df into a more suitable format to be saved
            df.rename(columns = {'level_0':'fn','level_1':'sha256','variable':'template_name'},inplace=True)
            additional_info = df.loc[:,['value']].to_dict('records')
            additional_info = [x['value'] for x in additional_info]
            add_df = pd.DataFrame.from_records(x for x in additional_info)
            df['distance'] = add_df['distance']
            df['closest_match'] = add_df['closest_match']
            # This will adjust the time sampling to the sampling rate (ideally this should be sourced from the DB and not from the config file)
            df['closest_match_time'] = df['closest_match'].apply(lambda x: datetime.timedelta(seconds=x * frame_sampling))
            df.drop(columns=['value'],inplace=True)

            return df
            

        elif not self.available_queries:
            raise Exception('No templates were found. Please check if the templates are located at {}'.format(self.templates_root))
            
        else:
            raise Exception('No matches were found at the current distance configuration ({})'.format(threshold))

    
    def find(self,query,threshold=0.07,plot=True):
        
        feats = self.template_cache[query]
        print('Loaded query embeddings',feats.shape)
        self.results_cache[query] = defaultdict()
        for repr_key in self.reprs.frame_level.list():
            try:
                sample = self.reprs.frame_level.read(repr_key)
                video_frames = self.reprs.frames.read(repr_key)
                
                distances = np.mean(cdist(feats,sample,metric='cosine'),axis=0)
                
                self.results_cache[query][repr_key] = dict()

                if len(distances) > 0:
                    frame_of_interest_index = np.argmin(distances)
                    min_d = min(distances)
                else:
                    frame_of_interest_index = 0
                    min_d = 1.0
                
                
                self.results_cache[query][repr_key]["distance"] = min_d
                self.results_cache[query][repr_key]["closest_match"] = frame_of_interest_index
        
                if (min_d < threshold) and plot:
                    
                    frame_of_interest = np.hstack(video_frames[frame_of_interest_index:][:5])
                    plt.figure(figsize=(20,10))
                    plt.imshow(frame_of_interest)
                    plt.show()

            except Exception as e:
                print('Error:',e,distances,repr_key,frame_of_interest_index)
                pass


def download_sample_templates(TEMPLATES_PATH,DOWNLOAD_URL="https://s3.amazonaws.com/winnowpretrainedmodels/templates.tar.gz"):
    if os.path.exists(TEMPLATES_PATH):
        print('Templates Found',glob(TEMPLATES_PATH + '/**'))

    else:    
        try:
            os.makedirs(TEMPLATES_PATH)
        except Exception as e:
            print(e)
            pass
        print('Downloading sample templates to:{}'.format(TEMPLATES_PATH))
        DST = TEMPLATES_PATH + '/templates.tar.gz'
        download_file(DST,DOWNLOAD_URL)
        # unzip files
        shutil.unpack_archive(DST,format='gztar')
        # Delete tar
        os.unlink(DST)
