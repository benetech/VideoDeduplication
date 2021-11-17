"""Input-Output utils."""
from functools import wraps

import numpy as np


def sig_loader(loader):
    """Make adaptive signature loader."""

    @wraps(loader)
    def wrapped_loader(*args, **kwargs):
        value = loader(*args, **kwargs)
        return normalize_sig_shape(value)

    return wrapped_loader


def normalize_sig_shape(signature: np.ndarray) -> np.ndarray:
    """Normalize signature (fingerprint) shape."""
    if len(signature.shape) == 2:
        return signature[0]
    return signature
