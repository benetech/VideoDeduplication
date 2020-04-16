
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.spatial.distance import cdist
from glob import glob
from winnow.feature_extraction.extraction_routine import load_featurizer
from winnow.feature_extraction.utils import load_image,load_video,download_file
import requests
import shutil
import os

class SearchEngine:
    def __init__(self,templates_root,library_glob,model):
        
        self.templates_root = templates_root
        self.library_glob = library_glob
        self.model = model
        self.available_queries = self.find_available_templates()
        self.frame_summaries = glob(library_glob)
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
        
    def create_annotation_report(self,threshold = 0.07,fp = 'template_test.csv',queries = None):

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

        records = pd.DataFrame.from_records(self.results_cache,index=None).reset_index()
        df = pd.melt(records,id_vars='index')
        summaries = dict() 
        for k,v in self.available_queries.items():        
            n = '{}.npy'.format(k)
            summaries[k] = n
            np.save(n,create_template_summary(glob(v + '/**')))
        df['match_video'] = df['index'].apply(lambda x:x.split('/')[-1].split('_vgg')[0])
        df['distance'] = df['value']
        df['query_video'] = df['variable'].apply(lambda x:summaries[x])
        msk = df['distance'] < threshold
        filtered = df.loc[msk,:]
        filtered.to_csv(fp)
        return filtered

    
    def find(self,query,threshold=0.07,plot=True):
        
        feats = self.template_cache[query]
        print('Loaded query embeddings',feats.shape)
        self.results_cache[query] = dict()
        for i in range(len(self.frame_summaries)):
            try:
                video_summary = self.frame_summaries[i]
                sample = np.load(video_summary)
                video_frames = np.load(video_summary.replace('features','frames'))
                
                distances = np.mean(cdist(feats,sample,metric='cosine'),axis=0)
                min_d = min(distances)
                self.results_cache[query][video_summary] = min_d
                
        
                if (min_d < threshold) and plot:
                    print('Minimum distance:{}'.format(min_d))
                    frame_of_interest = np.hstack(video_frames[np.argmin(distances):][:5])

                    plt.figure(figsize=(20,10))
                    plt.imshow(frame_of_interest)
                    plt.show()
            except:

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




def search_from_features(feats,threshold=0.07):
    for i in range(len(frame_summaries)):
    
        try:
            video_summary = frame_summaries[i]
            sample = np.load(video_summary)
            video_frames = np.load(video_summary.replace('features','frames'))

            distances = np.mean(cdist(feats,sample,metric='cosine'),axis=0)
            min_d = min(distances)

            
            if min_d < threshold:
                print('Minimum distance:{}'.format(min_d))
                frame_of_interest = np.hstack(video_frames[np.argmin(distances):][:5])

                plt.figure(figsize=(20,10))
                plt.imshow(frame_of_interest)
                plt.show()
        except Exception as e:
            print(e)
            