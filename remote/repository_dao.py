"""This module offers Data-Access-Objects for known remote repositories details."""
import abc
from typing import List, Optional

from remote.model import RemoteRepository, RepositoryStats


class RemoteRepoDAO(abc.ABC):
    """Manages known remote repository details."""

    @abc.abstractmethod
    def add(self, repository: RemoteRepository):
        """Register a new fingerprint repository."""

    @abc.abstractmethod
    def get(self, name) -> Optional[RemoteRepository]:
        """Get repository by name."""

    @abc.abstractmethod
    def rename(self, old_name: str, new_name: str):
        """Rename remote fingerprint repository."""

    @abc.abstractmethod
    def remove(self, repository: RemoteRepository):
        """Delete remote fingerprint repository."""

    @abc.abstractmethod
    def list(self, name=None, offset=0, limit=1000) -> List[RemoteRepository]:
        """List known fingerprint repositories."""

    @abc.abstractmethod
    def update_stats(self, stats: RepositoryStats):
        """Update repository statistics."""
