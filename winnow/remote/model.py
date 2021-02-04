"""This module offers model classes for remote repository clients."""
from abc import abstractmethod, ABC
from typing import Iterable, List, Optional

from dataclasses import dataclass


@dataclass
class LocalFingerprint:
    """Fingerprint data to be pushed to remote repository."""

    sha256: str
    fingerprint: bytes


@dataclass
class RemoteFingerprint:
    """Fingerprint from remote repository."""

    sha256: str
    fingerprint: bytes
    contributor: str


class RepositoryClient(ABC):
    """Abstract base class for repository clients."""

    @abstractmethod
    def push(self, fingerprints: Iterable[LocalFingerprint]):
        """Push fingerprints to the remote repository."""

    @abstractmethod
    def pull(self) -> List[RemoteFingerprint]:
        """Fetch fingerprints from the remote repository."""

    @abstractmethod
    def latest_contribution(self) -> Optional[LocalFingerprint]:
        """Get the latest local fingerprint pushed to this repository."""
