import logging
import os

from cached_property import cached_property

from db import Database
from template_support.file_storage import FileStorage, LocalFileStorage
from winnow import remote
from winnow.collection.file_collection import FileCollection
from winnow.collection.local_collection import LocalFileCollection
from winnow.config import Config
from winnow.remote import RemoteRepository
from winnow.remote.connect import RepoConnector, DatabaseConnector, ReprConnector
from winnow.remote.repository_dao import DBRemoteRepoDAO, CsvRemoteRepoDAO, RemoteRepoDAO
from winnow.security import SecureStorage
from winnow.storage.db_result_storage import DBResultStorage
from winnow.storage.metadata import FeaturesMetadata
from winnow.storage.remote_signatures_dao import (
    DBRemoteSignaturesDAO,
    ReprRemoteSignaturesDAO,
    RemoteSignaturesDAO,
)
from winnow.storage.repr_storage import ReprStorage
from winnow.storage.repr_utils import path_resolver, PathResolver
from winnow.utils.files import get_hash
from winnow.utils.repr import repr_storage_factory, filekey_resolver, FileKeyResolver

logger = logging.getLogger(__name__)


class PipelineContext:
    """Pipeline components created and wired consistently according to the pipeline Config."""

    def __init__(self, config: Config):
        """Create pipeline context."""
        self._config = config

    @cached_property
    def config(self) -> Config:
        """Get pipeline config."""
        return self._config

    @cached_property
    def repr_storage(self) -> ReprStorage:
        """Get representation storage."""
        return ReprStorage(
            directory=self.config.repr.directory,
            storage_factory=repr_storage_factory(self.config.repr.storage_type),
        )

    @cached_property
    def database(self) -> Database:
        """Get result database."""
        database = Database(uri=self.config.database.uri)
        database.create_tables()
        return database

    @cached_property
    def filekey(self) -> FileKeyResolver:
        """Get representation key getter."""
        return filekey_resolver(self.config)

    @cached_property
    def features_metadata(self) -> FeaturesMetadata:
        """Get features metadata."""
        return FeaturesMetadata(frame_sampling=self.config.proc.frame_sampling)

    @cached_property
    def storepath(self) -> PathResolver:
        """Get a function to convert absolute file paths to storage root-relative paths."""
        return path_resolver(self.config.sources.root)

    @cached_property
    def result_storage(self) -> DBResultStorage:
        """Get database result storage."""
        return DBResultStorage(database=self.database)

    @cached_property
    def remote_signature_dao(self) -> RemoteSignaturesDAO:
        """Get remote signature DAO depending on the config."""
        if self.config.database.use:
            return DBRemoteSignaturesDAO(self.database)
        storage_root = os.path.join(self.config.repr.directory, "remote_signatures")
        return ReprRemoteSignaturesDAO(root_directory=storage_root, output_directory=self.config.repr.directory)

    @cached_property
    def repository_dao(self) -> RemoteRepoDAO:
        """Get repository Data-Access-Object."""
        if self.config.database.use:
            return DBRemoteRepoDAO(database=self.database, secret_storage=self.secure_storage)
        return CsvRemoteRepoDAO(
            csv_file_path=os.path.join(self.config.repr.directory, "repositories.csv"),
            secret_storage=self.secure_storage,
        )

    @cached_property
    def secure_storage(self) -> SecureStorage:
        """Get secured credentials storage."""
        return SecureStorage(path=self.config.repr.directory, master_key_path=self.config.security.master_key_path)

    @cached_property
    def pretrained_model(self):
        """Load default model."""
        from winnow.feature_extraction import default_model_path, load_featurizer

        model_path = default_model_path(self.config.proc.pretrained_model_local_path)
        logger.info("Loading pretrained model from: %s", model_path)
        return load_featurizer(model_path)

    @cached_property
    def template_loader(self):
        """Get template loader."""
        from winnow.search_engine.template_loading import TemplateLoader

        return TemplateLoader(
            pretrained_model=self.pretrained_model,
            extensions=self.config.templates.extensions,
        )

    def make_connector(self, repo: RemoteRepository) -> RepoConnector:
        """Get remote repository connector."""
        client = remote.make_client(repo)
        if self.config.database.use:
            return DatabaseConnector(database=self.database, repo_client=client)
        return ReprConnector(
            remote_signature_dao=self.remote_signature_dao,
            signature_storage=self.repr_storage.signature,
            repo_client=client,
        )

    @cached_property
    def file_storage(self) -> FileStorage:
        """Create file storage for template examples."""
        return LocalFileStorage(directory=self.config.file_storage.directory)

    @cached_property
    def coll(self) -> FileCollection:
        """Get collection."""

        def calculate_hash(file_path: str) -> str:
            """Calculate hash."""
            return get_hash(file_path, mode=self.config.repr.hash_mode)

        return LocalFileCollection(
            root_path=self.config.sources.root,
            extensions=self.config.sources.extensions,
            calculate_hash=calculate_hash,
        )
