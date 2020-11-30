"""The config module offers high-level operations with pipeline configuration."""

from winnow.config import Config
from winnow.config.path import resolve_config_path


def resolve_config(config_path=None, frame_sampling=None, save_frames=None):
    """Resolve config from command-line arguments."""
    config_path = resolve_config_path(config_path)
    config = Config.read(config_path)

    # Read from command-line arguments
    if frame_sampling is not None:
        config.proc.frame_sampling = int(frame_sampling)
    if save_frames is not None:
        config.proc.save_frames = save_frames
    return config
