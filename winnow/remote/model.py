"""This module offers model classes for remote repository clients."""
import abc
from typing import Iterable, List, Optional, Any, Sequence
from urllib.parse import urlparse, quote

from dataclasses import dataclass

from db.schema import RepositoryType


@dataclass
class RemoteRepository:
    """Represents remote repository."""

    name: str
    address: str
    user: str
    type: RepositoryType
    credentials: Any = None

    @staticmethod
    def bare_database(name, address, user, password):
        """Create bare database repo."""
        parsed_address = urlparse(address)
        auth = f"{quote(user, safe='')}:{quote(password, safe='')}"
        uri = f"postgresql://{auth}@{parsed_address.netloc}{quote(parsed_address.path)}"
        return RemoteRepository(
            name=name,
            address=address,
            user=user,
            type=RepositoryType.BARE_DATABASE,
            credentials=uri,
        )


@dataclass
class LocalFingerprint:
    """Fingerprint data to be pushed to remote repository."""

    sha256: str
    fingerprint: Sequence[float]


@dataclass
class RemoteFingerprint:
    """Fingerprint from remote repository."""

    id: int
    sha256: str
    fingerprint: Sequence[float]
    contributor: str


class RepositoryClient(abc.ABC):
    """Abstract base class for repository clients."""

    @property
    @abc.abstractmethod
    def contributor_name(self) -> str:
        """Get contributor name."""
        pass

    @abc.abstractmethod
    def push(self, fingerprints: Iterable[LocalFingerprint]):
        """Push fingerprints to the remote repository."""
        pass

    @abc.abstractmethod
    def pull(self, start_from: int = 0, limit: int = 1000) -> List[RemoteFingerprint]:
        """Fetch fingerprints from the remote repository.

        Args:
            start_from (int): external fingerprint id (within remote repo) from which to start pulling.
            limit (int): maximal number of fingerprints to pull at once. Must be between 0 and 10000.
        """
        pass

    @abc.abstractmethod
    def latest_contribution(self) -> Optional[LocalFingerprint]:
        """Get the latest local fingerprint pushed to this repository."""
        pass

    @abc.abstractmethod
    def count(self, start_from: int = 0) -> int:
        """Get count of fingerprint with id greater than the given one."""
        pass
