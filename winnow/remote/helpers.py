"""This module offers coarse-grained helper-functions to work with remote repositories."""

from db.schema import Files
from winnow.remote.model import LocalFingerprint


def file_to_local_fingerprint(file: Files) -> LocalFingerprint:
    """Convert file to LocalFingerprint."""
    return LocalFingerprint(sha256=file.sha256, fingerprint=file.signature.signature)
