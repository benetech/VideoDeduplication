"""This module offers coarse-grained helper-functions to work with remote repositories."""
import pickle

from db.schema import Files
from remote.model import LocalFingerprint


def file_to_local_fingerprint(file: Files) -> LocalFingerprint:
    """Convert file to LocalFingerprint."""
    return LocalFingerprint(sha256=file.sha256, fingerprint=pickle.loads(file.signature.signature))
