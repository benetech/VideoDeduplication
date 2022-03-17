import os
import pickle
import sys
from functools import partial
from glob import glob
from os.path import join, dirname
from pathlib import Path
from typing import Optional, Dict

import matplotlib.pyplot as plt
import numpy as np
import torch

import winnow.text_search.bigfile as bigfile
import winnow.text_search.configs as configs
import winnow.text_search.textlib as textlib
import winnow.text_search.txt2vec as txt2vec
from winnow.storage.remote_file_repo import RemoteFileRepo, BaseUrl
from winnow.text_search.bigfile import BigFile
from winnow.text_search.evaluation import compute_sim
from winnow.text_search.model import get_model, CrossModalNetwork
from winnow.text_search.similarity_index import SimilarityIndex
from winnow.text_search.textlib import TextTool

# FIXME: Fix the model_best.pth.tar imports (#460)
# The model is saved using pickle with different import paths
# (e.g. `import configs` instead of import `winnow.text_search.configs`).
sys.modules["configs"] = configs
sys.modules["txt2vec"] = txt2vec
sys.modules["bigfile"] = bigfile
sys.modules["textlib"] = textlib

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

    return models.get(DEFAULT_MODEL_VIDEO), models.get(DEFAULT_MODEL_TEXT), models.get(DEFAULT_MODEL_VOCAB)


def load_model(path_to_model=None, path_to_w2v=None) -> CrossModalNetwork:

    # with set_directory(Path(__file__).parent.resolve()) as context:
    current_path = Path(os.path.curdir).resolve()
    context_path = Path(__file__).parent.resolve()

    os.chdir(context_path)

    path_to_model, path_to_w2v, _ = default_video_search_models_path()

    path_to_model = os.path.abspath(path_to_model)
    path_to_w2v = os.path.abspath(path_to_w2v)

    # pickle.load = partial(pickle.load, encoding="latin1")
    # pickle.Unpickler = partial(pickle.Unpickler, encoding="latin1")
    checkpoint = torch.load(
        os.path.join(path_to_model),
        map_location=lambda storage, loc: storage,
        # pickle_module=pickle,
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

    signature_files = glob(os.path.join(signatures_folder, "**/*.npy"), recursive=True)
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


def get_signature_activations(topic, signature_data, model=None):

    if model is None:
        model = load_model()

    vis_vec = np.array([model.embed_vis(signature_data)[0].numpy()])

    sent_vec = model.embed_txt(topic).numpy()
    sims = compute_sim(sent_vec, vis_vec, measure="cosine")[0]
    return sims


def load_vocab(path):

    return np.load(path, allow_pickle=True)


def get_human_readable(tokens, vocab, placeholder="<NA>"):

    in_vocab = [x if x in vocab else placeholder for x in tokens]

    return " ".join(in_vocab)


def get_query_context(topic, placeholder="<NA>"):
    text_tool = TextTool()
    artifacts = model_artifacts()
    vocab = load_vocab(artifacts.get(DEFAULT_MODEL_VOCAB))

    tokens = text_tool.tokenize(topic, remove_stopword=True)
    clean_tokens = [x for x in tokens if x in vocab]
    human_readable = " ".join([x if x in clean_tokens else placeholder for x in tokens])
    score = len(clean_tokens) / len(tokens)

    return dict(
        original_query=topic,
        tokens=tokens,
        clean_tokens=clean_tokens,
        human_readable=human_readable,
        score=score,
    )


def query_signatures(
    topic: str,
    file_index: SimilarityIndex,
    model: CrossModalNetwork = None,
    min_similarity: float = 0.05,
    max_count: Optional[int] = None,
):
    query_data = get_query_context(topic)
    sent_vec = model.embed_txt(topic).numpy()[0]
    ranklist = file_index.query(sent_vec, min_similarity, max_count)
    ids, similarities = zip(*ranklist) if len(ranklist) > 0 else ([], [])
    return ids, similarities, query_data


def preview_query_results(topic, files, distances, frames_mapping, preview_samples, verbose, plot_preview):
    for i in range(min(preview_samples, len(files))):
        video_code, distance = files[i], distances[i]
        try:
            if verbose:
                print("Query:", topic)
                print("Rank:", i + 1, "Video:", video_code, "Similarity:", distance)
            if plot_preview:
                frames_file = frames_mapping[video_code]
                assert os.path.exists(frames_file), "Frames file not found"
                print(frames_file)
                show_preview_from_frames(frames_file)
        except Exception as e:
            print("a", e)
            pass


def get_frame_mapping(path_to_frames: str) -> Dict[str, str]:
    """Build mapping from file name to file path."""
    assert os.path.exists(path_to_frames), "Frames Folder not found"
    # get frames required for video preview
    frame_files = glob(os.path.join(path_to_frames, "**"))

    assert len(frame_files) > 0, "No frames found"

    # allows quick lookup of frame files
    frames_mapping = {os.path.basename(v[:-82]): v for v in frame_files}
    return frames_mapping


class VideoSearch:
    """Video Search class"""

    def __init__(self, file_index: SimilarityIndex, model: CrossModalNetwork = None):
        """Instantiate a VideoSearch object

        Args:
             file_index(SimilarityIndex): Index to efficiently query similar file vectors.
             model (CrossModalNetwork): Text-Vis matching model.
        """

        self.model = model or load_model()
        self.file_index = file_index

    def query(
        self,
        topic,
        min_similarity: float = 0.05,
        max_count: Optional[int] = 10000,
    ):
        files, similarity_scores, query_data = query_signatures(
            topic,
            self.file_index,
            self.model,
            min_similarity,
            max_count,
        )

        return files, similarity_scores, query_data


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
        query_signatures,
        file_basenames=video_file_basenames,
        vectors=vis_vecs,
        model=model,
        frames_mapping=frames_mapping,
    )

    return search_engine
