from os.path import join, dirname

from winnow.storage.remote_file_repo import RemoteFileRepo, BaseUrl

# Default pretrained models base URL
DEFAULT_URL = "https://s3.amazonaws.com/winnowpretrainedmodels/"

# Default pretrained model file name
DEFAULT_MODEL = 'vgg_16.ckpt'

# Default pretrained model directory
DEFAULT_DIRECTORY = join(dirname(__file__), "pretrained_models")


def pretrained_models(directory=None, base_url=None):
    """Get remote file repository containing pretrained models."""
    directory = directory or DEFAULT_DIRECTORY
    base_url = base_url or DEFAULT_URL
    return RemoteFileRepo(directory=directory, remote=BaseUrl(base_url))


def default_model_path(directory=None, base_url=None):
    """Get default pretrained model path."""
    models = pretrained_models(directory, base_url)
    return models.get(DEFAULT_MODEL)
