from .siamese_net import DNN
from glob import glob
import os
import numpy as np

package_directory = os.path.dirname(os.path.abspath(__file__))
similarity_model_pretrained = os.path.join(package_directory,'model')



class SimilarityModel:

    def __init__(self):

        self.src = None
        self.model = None
        self.features = []
        self.embeddings = None
        self.index = []
    
    def predict(self,src):
        self.src = src
        if len(self.features) == 0:

            self.build_features()

        if self.model is None:
            print(np.array(self.features).shape)
            self.model = DNN(np.array(self.features).shape[1],None,similarity_model_pretrained,load_model=True,trainable=False)
        
        embeddings = self.model.embeddings(np.array(self.features))
        return embeddings


    
    def build_features(self):

        video_level_paths = glob(os.path.join(self.src,'**vgg_features.npy'))

        for vid in video_level_paths:
            self.features.append(np.load(vid)[0])
            self.index.append(vid)

        
    def save(dst):

        if self.embeddings is not None:
            np.save(dst,self.features)

        else:
            print('Please use the model to extract embeddings first by using the predict method')






        






