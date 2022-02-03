from distutils.command import clean
import pickle
from functools import partial
import os
import torch
import matplotlib.pyplot as plt
from glob import glob
import numpy as np
from pathlib import Path
from functools import partial
from os.path import join, dirname


from winnow.text_search.model import get_model
from  winnow.text_search.bigfile import BigFile
from  winnow.text_search.evaluation import compute_sim
from winnow.text_search.textlib import TextTool
from winnow.text_search.txt2vec import W2Vec


from winnow.storage.remote_file_repo import RemoteFileRepo, BaseUrl

MODEL_PATH = "./models/model_best.pth.tar"
W2V_PATH = "./models/vec500flickr30m.bin"

# Default pretrained models base URL
DEFAULT_URL = "https://s3.amazonaws.com/justiceai/"

# Default pretrained model file name
DEFAULT_MODEL_VIDEO = "model_best.pth.tar"
DEFAULT_MODEL_TEXT = "vec500flickr30m.bin"
DEFAULT_MODEL_VOCAB = "vocab.npy"

# Default pretrained model directory
DEFAULT_DIRECTORY = join(dirname(__file__), "models/")


def model_artifacts(directory=None, base_url=None):
    """Get remote file repository containing pretrained models."""
    directory = directory or DEFAULT_DIRECTORY
    base_url = base_url or DEFAULT_URL
    return RemoteFileRepo(directory=directory, remote=BaseUrl(base_url))


def default_video_search_models_path(directory=None, base_url=None):
    """Get default pretrained model path."""
    models = model_artifacts(directory, base_url)

    return models.get(DEFAULT_MODEL_VIDEO),models.get(DEFAULT_MODEL_TEXT),models.get(DEFAULT_MODEL_VOCAB)


def load_model(path_to_model=None, path_to_w2v=None):

    # with set_directory(Path(__file__).parent.resolve()) as context:
    current_path = Path(os.path.curdir).resolve()
    context_path = Path(__file__).parent.resolve()

    os.chdir(context_path)

    path_to_model,path_to_w2v,_ = default_video_search_models_path()

    path_to_model = os.path.abspath(path_to_model)
    path_to_w2v = os.path.abspath(path_to_w2v)

    pickle.load = partial(pickle.load, encoding="latin1")
    pickle.Unpickler = partial(pickle.Unpickler, encoding="latin1")
    checkpoint = torch.load(
        os.path.join(path_to_model),
        map_location=lambda storage, loc: storage,
        pickle_module=pickle,
        encoding="latin1",
    )
    config = checkpoint["config"]
    if hasattr(config, "t2v_w2v"):
        w2v_feature_file = path_to_w2v
        config.t2v_w2v.w2v.binary_file = w2v_feature_file

    model = get_model("w2vvpp")(config)
    model.load_state_dict(checkpoint["model"])

    # Resume working on original directory
    os.chdir(current_path)

    return model


def load_search_space_bigfile(path_to_features, model):

    bigfile = BigFile(path_to_features)
    videoset = bigfile.names
    file_basenames, vectors = bigfile.read(videoset)
    vis_vecs = np.array([model.embed_vis(x)[0].numpy() for x in vectors])

    return file_basenames, vis_vecs


def show_preview(base_url, video_code):

    files = glob(os.path.join(base_url, video_code, "**.jpg"))
    print(len(files), " frames found")
    sample = files[:5]
    img_data = []
    for fp in sample:

        im = plt.imread(fp)
        img_data.append(im)

    preview = np.hstack(img_data)
    plt.figure(figsize=(20, 20))
    plt.imshow(preview)
    plt.show()


def query_bigfile(topic, file_basenames, vectors, model, base_preview_fp, preview_samples=10):

    sent_vec = model.embed_txt(topic).numpy()
    ranklist = [(file_basenames[i], sim) for i, sim in enumerate(compute_sim(sent_vec, vectors, measure="cosine")[0])]
    ranklist.sort(key=lambda v: v[1], reverse=True)
    for i in range(preview_samples):
        video_code, distance = ranklist[i]
        try:
            print("Query:", topic)
            print("Rank:", i + 1, "Video:", video_code, "Similarity:", distance)
            video_code = os.path.basename(video_code).split(".")[0]
            show_preview(base_preview_fp, video_code)
        except Exception as e:
            print(e)
            pass

    return ranklist


def load_search_space_from_signatures(signatures_folder, model):

    signature_files = glob(os.path.join(signatures_folder, "**.npy"), recursive=True)
    basenames = [os.path.basename(x) for x in signature_files]
    videofile_basenames = [v[:-82] for v in basenames]
    signature_data = (np.load(x) for x in signature_files)
    # This could potentially be refactored to use a Annoy Index (for persistence, indexing and search performance)
    vis_vecs = np.array([model.embed_vis(x)[0].numpy() for x in signature_data])

    return videofile_basenames, vis_vecs


def show_preview_from_frames(frames_file):

    image_data = np.load(frames_file)
    sample = image_data[:5]

    preview = np.hstack(sample)
    plt.figure(figsize=(20, 20))
    plt.imshow(preview)
    plt.show()


def get_signature_activations(topic, signature_data, model=None ):

    if model is None:
        model = load_model()

    vis_vec = np.array([model.embed_vis(signature_data)[0].numpy()])

    sent_vec = model.embed_txt(topic).numpy()
    sims = compute_sim(sent_vec, vis_vec, measure="cosine")[0]
    return sims



def load_vocab(path):

    return np.load(path,allow_pickle=True)


def get_human_readable(tokens,vocab,placeholder="<NA>"):

    in_vocab = [x if x in vocab else placeholder for x in tokens ]
    
    return " ".join(in_vocab)
    

def get_query_context(topic,placeholder="<NA>"):
     
     text_tool = TextTool()
     artifacts = model_artifacts()
     vocab = load_vocab(artifacts.get(DEFAULT_MODEL_VOCAB))

     tokens = text_tool.tokenize(topic,remove_stopword=True)
     clean_tokens = [x for x in tokens if x in vocab]
     human_readable = " ".join([x if x in clean_tokens else placeholder for x in tokens ])
     score = len(clean_tokens) / len(tokens)

     return dict(original_query=topic,tokens=tokens,clean_tokens=clean_tokens,human_readable=human_readable,score=score)
    
    
def query_signatures(topic, file_basenames=None, vectors=None, model=None, frames_mapping=None, preview_samples=10,verbose=False,plot_preview=False,query_transparency=True):

    assert vectors is not None,"No signature data provided"
    
    if file_basenames is None:

        file_basenames = np.array(list(range(len(vectors))))

    query_data=get_query_context(topic)
    if query_transparency:
        pass
        # text_tool = TextTool()
        # tokens = text_tool.tokenize(topic)
        # query_data["tokens"] = tokens


    sent_vec = model.embed_txt(topic).numpy()
    
    ranklist = [(file_basenames[i], sim) for i, sim in enumerate(compute_sim(sent_vec, vectors, measure="cosine")[0])]
    ranklist.sort(key=lambda v: v[1], reverse=True)
    for i in range(preview_samples):
        video_code, distance = ranklist[i]
        try:
            if verbose:
                print("Query:", topic)
                print("Rank:", i + 1, "Video:", video_code, "Similarity:", distance)
            
            if plot_preview:

                assert os.path.exists(frames_file),"Frames file not found"
                frames_file = frames_mapping[video_code]
                print(frames_file)
                show_preview_from_frames(frames_file)
        except Exception as e:
            print("a",e)
            pass


    files, sims = zip(*ranklist)

    return files,sims,query_data


class VideoSearch:

    """Video Search class
    """


    def __init__(self,path_to_signatures,path_to_model=MODEL_PATH,path_to_frames=None):
        """Instantiate a VideoSearch object

        Args:
             path_to_signatures (str): Path to a folder containing video signatures
             path_to_frames (path,optional): Path to a folder containing video signatures
             path_to_model (path, optional): [description]. Defaults to MODEL_PATH.
        """

        self.model = load_model(path_to_model)
        self.video_file_basenames, self.vis_vecs = load_search_space_from_signatures(path_to_signatures, self.model)
        self.frame_files = None
        self.frames_mapping = None
        
    
        if path_to_frames is not None:
            self.__process_frames__(path_to_frames)

    
    def __process_frames__(self,path_to_frames):
        """Allows frames to be visualized"""

        assert os.path.exists(path_to_frames),"Frames Folder not found"
         # get frames required for video preview
        self.frame_files = glob(os.path.join(path_to_frames, "**"))

        assert len(self.frame_files) > 0, "No frames found"

        # allows quick lookup of frames file
        self.frames_mapping = {os.path.basename(v[:-82]): v for v in self.frame_files}


    def query(self,topic,preview_samples=10,verbose=False,plot_preview=False,path_to_frames=None,query_transparency=True):

        if path_to_frames is not None:
            self.__process_frames__(path_to_frames)

        files,distances,query_data = query_signatures(topic,self.video_file_basenames,self.vis_vecs,self.model,self.frames_mapping,preview_samples,verbose,plot_preview)

        return files,distances,query_data





def get_search_engine(path_to_signatures, path_to_frames, path_to_model=MODEL_PATH):
    """High level function to get a search engine for videos (DEPRECATED)

    Args:
        path_to_signatures (str): Path to a folder containing video signatures
        path_to_frames (str): Path to a folder containing video signatures
        path_to_model (path, optional): [description]. Defaults to MODEL_PATH.

    Returns:
        [type]: [description]
    """

    # Load pre-trained model
    model = load_model(path_to_model)

    # Load search embeddings (implement load from local storage if available)
    video_file_basenames, vis_vecs = load_search_space_from_signatures(path_to_signatures, model)

    # get frames required for video preview
    frames = glob(os.path.join(path_to_frames, "**"))
    # allows quick lookup of frames file
    frames_mapping = {os.path.basename(v[:-82]): v for v in frames}

    # instantiates the search engine
    search_engine = partial(
        query_signatures, file_basenames=video_file_basenames, vectors=vis_vecs, model=model, frames_mapping=frames_mapping
    )

    return search_engine
