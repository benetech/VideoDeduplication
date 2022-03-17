import logging

import numpy as np
from dataclasses import astuple

from db.access.files import FilesDAO
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.text_search.similarity_index import AnnoySimilarityIndex
from winnow.utils.iterators import chunks


def prepare_text_search(
    pipeline: PipelineContext,
    force: bool = True,
    progress: ProgressMonitor = ProgressMonitor.NULL,
):
    """Build text similarity index for existing fingerprints."""
    logger = logging.getLogger(__name__)
    progress.scale(1.0)

    # Skip index building if not required
    if not force and pipeline.text_search_id_index_exists():
        logger.info("Text search index already exists.")
        progress.complete()
        return
    elif force and pipeline.text_search_id_index_exists():
        logger.info("Rebuilding text search index because force=True")
    elif not pipeline.text_search_id_index_exists():
        logger.info("Text-search is missing and will be created.")

    logger.info("Loading fingerprints.")
    fingerprint_storage = pipeline.repr_storage.signature
    file_keys, fingerprints = [], []
    for file_key in fingerprint_storage.list():
        fingerprint = fingerprint_storage.read(file_key)
        file_keys.append(file_key)
        fingerprints.append(fingerprint)
    progress.increase(0.3)
    logger.info("Loaded %s fingerprints", len(fingerprints))

    logger.info("Getting database ids")
    file_ids = []
    for chunk in chunks(file_keys, size=10000):
        with pipeline.database.session_scope() as session:
            ids_chunk = FilesDAO.query_local_file_ids(session, map(astuple, chunk)).all()
            file_ids.extend(ids_chunk)
    logger.info("Loaded %s database ids", len(file_ids))
    progress.increase(0.1)

    logger.info("Loading the text search model")
    model = pipeline.text_search_model

    logger.info("Converting fingerprints using the text-search model")
    vectors = np.array([model.embed_vis(fingerprint)[0].numpy() for fingerprint in fingerprints])

    logger.info("Building annoy text search index.")
    index = AnnoySimilarityIndex()
    index.fit(file_ids, np.array(vectors))

    logger.info("Saving text-search index.")
    index.save(pipeline.config.repr.directory, pipeline.TEXT_SEARCH_INDEX_NAME, pipeline.TEXT_SEARCH_DATABASE_IDS_NAME)
    progress.complete()
