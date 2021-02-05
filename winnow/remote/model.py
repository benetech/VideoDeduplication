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

    id: int
    sha256: str
    fingerprint: bytes
    contributor: str


class RepositoryClient(ABC):
    """Abstract base class for repository clients."""

    @abstractmethod
    def push(self, fingerprints: Iterable[LocalFingerprint]):
        """Push fingerprints to the remote repository."""

    @abstractmethod
    def pull(self, start_from: int, limit: int = 1000) -> List[RemoteFingerprint]:
        """Fetch fingerprints from the remote repository.

        Args:
            start_from (int): external fingerprint id (within remote repo) from which to start pulling.
            limit (int): maximal number of fingerprints to pull at once. Must be between 0 and 10000.
        """

    @abstractmethod
    def latest_contribution(self) -> Optional[LocalFingerprint]:
        """Get the latest local fingerprint pushed to this repository."""

    @abstractmethod
    def count(self, start_from: int) -> int:
        """Get count of fingerprint with id greater than the given one."""
