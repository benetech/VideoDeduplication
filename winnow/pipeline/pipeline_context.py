import logging
import os
from typing import Callable

from cached_property import cached_property

import remote
from db import Database
from remote import RemoteRepository, RepositoryClient, make_client
from remote.connect import RepoConnector, DatabaseConnector, ReprConnector
from remote.repository_dao import RemoteRepoDAO
from remote.repository_dao_csv import CsvRemoteRepoDAO
from remote.repository_dao_database import DBRemoteRepoDAO
from security import SecureStorage
from template_support.file_storage import FileStorage, LocalFileStorage
from winnow.config import Config
from winnow.storage.db_result_storage import DBResultStorage
from winnow.storage.file_key import FileKey
from winnow.storage.metadata import FeaturesMetadata
from winnow.storage.remote_signatures_dao import (
    DBRemoteSignaturesDAO,
    ReprRemoteSignaturesDAO,
    RemoteSignaturesDAO,
)
from winnow.storage.repr_storage import ReprStorage
from winnow.storage.repr_utils import path_resolver
from winnow.text_search.main_utils import load_model as load_text_search_model, VideoSearch
from winnow.text_search.model import CrossModalNetwork
from winnow.text_search.similarity_index import AnnoySimilarityIndex, SimilarityIndex
from winnow.utils.repr import repr_storage_factory, filekey_resolver

logger = logging.getLogger(__name__)


class ComponentNotAvailable(Exception):
    """Error indicating component is not available."""


class PipelineContext:
    """Pipeline components created and wired consistently according to the pipeline Config."""

    TEXT_SEARCH_INDEX_NAME = "text_search_annoy_index"
    TEXT_SEARCH_DATABASE_IDS_NAME = "text_search_database_ids"
    TEXT_SEARCH_N_FEATURES = 2048

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
        database = Database.from_uri(uri=self.config.database.uri)
        database.create_tables()
        return database

    @cached_property
    def filekey(self) -> Callable[[str], FileKey]:
        """Get representation key getter."""
        return filekey_resolver(self.config)

    @cached_property
    def features_metadata(self) -> FeaturesMetadata:
        """Get features metadata."""
        return FeaturesMetadata(frame_sampling=self.config.proc.frame_sampling)

    @cached_property
    def storepath(self) -> Callable:
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

    def make_client(self, repo: RemoteRepository) -> RepositoryClient:
        """Make repository client."""
        return make_client(repo)

    @cached_property
    def file_storage(self) -> FileStorage:
        """Create file storage for template examples."""
        return LocalFileStorage(directory=self.config.file_storage.directory)

    def text_search_id_index_exists(self) -> bool:
        """Check if text index exists."""
        return AnnoySimilarityIndex.exists(
            directory=self.config.repr.directory,
            index_name=self.TEXT_SEARCH_INDEX_NAME,
            ids_name=self.TEXT_SEARCH_DATABASE_IDS_NAME,
        )

    @cached_property
    def text_search_model(self) -> CrossModalNetwork:
        """Get prepared semantic text search model."""
        return load_text_search_model()

    @cached_property
    def text_search_id_index(self) -> SimilarityIndex:
        """Get semantic search index."""
        index = AnnoySimilarityIndex()
        try:
            index.load(
                directory=self.config.repr.directory,
                index_name=self.TEXT_SEARCH_INDEX_NAME,
                ids_name=self.TEXT_SEARCH_DATABASE_IDS_NAME,
                n_features=self.TEXT_SEARCH_N_FEATURES,
            )
        except FileNotFoundError:
            raise ComponentNotAvailable("Semantic text search index not found. Did you forget to create one?")
        return index

    @cached_property
    def text_search_engine(self) -> VideoSearch:
        """Get semantic text search engine."""
        return VideoSearch(self.text_search_id_index, self.text_search_model)
