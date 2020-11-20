import os

import numpy as np

from .siamese_net import DNN

package_directory = os.path.dirname(os.path.abspath(__file__))
similarity_model_pretrained = os.path.join(package_directory, 'model')


class SimilarityModel:

    def __init__(self):
        self.model = None

    def predict(self, file_feature_dict):
        """
        Args:
            file_feature_dict: A dictionary mapping from original (path,hash)
            to video-level feature tensor.
        """
        # Get array of (path,hash) and array of corresponding feature
        # values in the same order
        keys, features = zip(*file_feature_dict.items())
        features = np.array([tensor[0] for tensor in features])
        embeddings = self.predict_from_features(features)

        return dict(zip(keys, embeddings))

    def predict_from_features(self, features):

        # Create model
        if self.model is None:
            print(f"Creating similarity model for shape {features.shape}")
            self.model = DNN(
                            features.shape[1],
                            None,
                            similarity_model_pretrained,
                            load_model=True,
                            trainable=False)

        embeddings = self.model.embeddings(features)
        embeddings = np.nan_to_num(embeddings)
        return embeddings
