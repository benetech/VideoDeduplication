import logging
from datetime import datetime
from typing import Optional, List

from db import Database
from db.schema import Repository, Contributor
from remote import RemoteRepository
from remote.model import RepositoryStats
from remote.repository_dao import RemoteRepoDAO
from security import SecureStorage, SecretNamespace

# Default module logger
logger = logging.getLogger(__name__)


class DBRemoteRepoDAO(RemoteRepoDAO):
    """Data Access Object for remote repository details stored in a local database."""

    def __init__(self, database: Database, secret_storage: SecureStorage):
        self._database = database
        self._secret_storage = secret_storage

    def add(self, repository: RemoteRepository):
        """Register a new fingerprint repository."""
        new_repository = Repository(
            name=repository.name,
            repository_type=repository.type,
            network_address=repository.address,
            account_id=repository.user,
        )
        self.add_entity(new_repository, repository.credentials)

    def add_entity(self, repository: Repository, credentials: str) -> Repository:
        """Create repository from entity."""
        if not SecureStorage.is_valid_name(repository.name):
            raise ValueError(f"Invalid repository name: {repository.name}")

        with self._database.session_scope(expunge=True) as session:
            # Save database entity
            session.add(repository)

        # Save credentials
        try:
            self._secret_storage.set_secret(
                SecretNamespace.REPOS,
                secret_name=repository.name,
                secret_data=credentials,
            )
        except Exception:
            # Remove entity if we cannot store credentials
            with self._database.session_scope(expunge=True) as session:
                session.query(Repository).filter(Repository.name == repository.name).delete()
            raise

        return repository

    def get(self, name) -> Optional[RemoteRepository]:
        """Get repository by name."""
        with self._database.session_scope() as session:
            entity = session.query(Repository).filter(Repository.name == name).one_or_none()

            if entity is None:
                return None

            return self._from_entity(entity)

    def get_by_id(self, repository_id: int) -> Optional[RemoteRepository]:
        """Get repository by id."""
        with self._database.session_scope() as session:
            entity = session.query(Repository).filter(Repository.id == repository_id).one_or_none()

            if entity is None:
                return None

            return self._from_entity(entity)

    def rename(self, old_name, new_name):
        """Rename remote fingerprint repository."""
        if not SecureStorage.is_valid_name(new_name):
            raise ValueError(f"Invalid repository name: {new_name}")

        # Update repository
        with self._database.session_scope(expunge=True) as session:
            entity = session.query(Repository).filter(Repository.name == old_name).one_or_none()
            if entity is None:
                raise KeyError(f"Repository not found: {old_name}")
            entity.name = new_name

            try:
                # Move credentials
                credentials = self._secret_storage.get_secret(SecretNamespace.REPOS, old_name)
                self._secret_storage.remove_secret(SecretNamespace.REPOS, old_name)
                self._secret_storage.set_secret(SecretNamespace.REPOS, secret_name=new_name, secret_data=credentials)
            except KeyError:
                raise KeyError(f"Repository credentials are missing: {old_name}")

    def remove(self, repository: RemoteRepository):
        """Delete remote fingerprint repository."""
        with self._database.session_scope() as session:
            # Remove repository from database
            session.query(Repository).filter(Repository.name == repository.name).delete()

            try:
                # Remove credentials within the same transaction
                self._secret_storage.remove_secret(SecretNamespace.REPOS, secret_name=repository.name)
            except KeyError:
                logger.warning("Repository credentials are missing: %s", repository.name)

    def list(self, name=None, offset=0, limit=1000) -> List[RemoteRepository]:
        """List known fingerprint repositories."""

        # Query repos
        with self._database.session_scope() as session:
            query = session.query(Repository)
            if name is not None:
                query = query.filter(Repository.name.ilike(f"%{name}%"))
            entities = query.offset(offset).limit(limit).all()
            return [self._from_entity(repo) for repo in entities]

    def _from_entity(self, entity: Repository) -> RemoteRepository:
        """Convert repository database entity to RemoteRepository model."""
        credentials = self._secret_storage.get_secret(SecretNamespace.REPOS, secret_name=entity.name)

        return RemoteRepository(
            name=entity.name,
            address=entity.network_address,
            user=entity.account_id,
            type=entity.repository_type,
            credentials=credentials,
        )

    def update_stats(self, stats: RepositoryStats) -> Repository:
        with self._database.session_scope() as session:
            repo: Repository = session.query(Repository).filter(Repository.name == stats.repo.name).one_or_none()
            if repo is None:
                raise KeyError(f"No such repository: {stats.repo.name}")

            repo.last_sync = datetime.now()
            repo.pushed_fingerprint_count = stats.pushed_count
            repo.total_fingerprint_count = stats.total_count

            contributors: List[Contributor] = (
                session.query(Contributor).filter(Contributor.repository_id == repo.id).all()
            )
            contributors_index = {contrib.name: contrib for contrib in contributors}
            for contrib_stats in stats.contributors:
                if contrib_stats.name not in contributors_index and contrib_stats.name != repo.account_id:
                    new_contributor = Contributor(
                        repository_id=repo.id,
                        name=contrib_stats.name,
                        fingerprints_count=contrib_stats.fingerprints_count,
                    )
                    session.add(new_contributor)
                elif contrib_stats.name != repo.account_id:
                    contributor = contributors_index[contrib_stats.name]
                    contributor.fingerprints_count = contrib_stats.fingerprints_count
