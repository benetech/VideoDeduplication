import hashlib
import logging
import os
from os import PathLike
from typing import Union, Tuple

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
from winnow.collection.file_collection import FileCollection
from winnow.collection.local_collection import LocalFileCollection
from winnow.config import Config
from winnow.config.config import HashMode
from winnow.storage.db_result_storage import DBResultStorage
from winnow.storage.metadata import FeaturesMetadata
from winnow.storage.remote_signatures_dao import (
    DBRemoteSignaturesDAO,
    ReprRemoteSignaturesDAO,
    RemoteSignaturesDAO,
    DBRemoteMatchesDAO,
    RemoteMatchesDAO,
    RemoteMatchesReportDAO,
)
from winnow.storage.repr_storage import ReprStorage
from winnow.storage.repr_utils import path_resolver, PathResolver
from winnow.text_search.main_utils import load_model as load_text_search_model, VideoSearch
from winnow.text_search.model import CrossModalNetwork
from winnow.text_search.similarity_index import AnnoySimilarityIndex, SimilarityIndex
from winnow.utils.files import FileHashFunc, hash_path, HashCache, hash_file, PathTime
from winnow.utils.repr import repr_storage_factory

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
    def remote_matches_dao(self) -> RemoteMatchesDAO:
        """Get remote matches storge."""
        if self.config.database.use:
            return DBRemoteMatchesDAO(self.database)
        storage_root = os.path.join(self.config.repr.directory, "remote_matches")
        return RemoteMatchesReportDAO(directory=storage_root)

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

    @cached_property
    def calculate_hash(self) -> FileHashFunc:
        """Get file hashing function."""

        if self.config.sources.hash_mode == HashMode.PATH:
            return hash_path
        if self.config.sources.hash_mode == HashMode.PATH_MTIME:
            return lambda path: hash_path(path, mtime=True)
        if self.config.sources.hash_cache is None:
            return hash_file

        # Otherwise, cache file hashes
        data_folder = self.config.sources.root
        cache_folder = self.config.sources.hash_cache
        os.makedirs(cache_folder, exist_ok=True)
        cache = HashCache(map_path=HashCache.rebase_path(data_folder, cache_folder, suffix="sha256"))

        @cache.wrap
        def calculate_hash(path: Union[str, PathLike]) -> str:
            """Calculate file hash."""
            return hash_file(path, algorithm=hashlib.sha256)

        return calculate_hash

    @cached_property
    def coll(self) -> FileCollection:
        """Get collection."""

        return LocalFileCollection(
            root_path=self.config.sources.root,
            extensions=self.config.sources.extensions,
            calculate_hash=self.calculate_hash,
        )

    @cached_property
    def text_search_model(self) -> CrossModalNetwork:
        """Get prepared semantic text search model."""
        return load_text_search_model()

    @cached_property
    def text_search_index_prefix(self) -> str:
        return os.path.join(self.config.repr.directory, "text_search/similarity")

    @cached_property
    def text_search_index_suffixes(self) -> Tuple[str, str]:
        return ".index.annoy", ".ids.npy"

    @cached_property
    def text_search_id_index(self) -> SimilarityIndex:
        """Get semantic search index."""
        index = AnnoySimilarityIndex()
        paths, _ = PathTime.latest_group(
            common_prefix=self.text_search_index_prefix,
            suffixes=self.text_search_index_suffixes,
        )
        if paths is None:
            raise ComponentNotAvailable("Semantic text search index not found. Did you forget to create one?")

        index_path, ids_path = paths
        index.load(
            index_path=index_path,
            ids_path=ids_path,
            n_features=self.TEXT_SEARCH_N_FEATURES,
            allow_pickle=True,
        )
        return index

    @cached_property
    def text_search_engine(self) -> VideoSearch:
        """Get semantic text search engine."""
        return VideoSearch(self.text_search_id_index, self.text_search_model)
