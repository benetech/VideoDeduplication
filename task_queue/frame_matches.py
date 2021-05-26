from typing import List, Dict

import pandas as pd
from sqlalchemy import tuple_

from db.schema import Files
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.utils.iterators import chunks


def get_frame_matches(template_matches: pd.DataFrame, pipeline: PipelineContext) -> List[Dict]:
    """Convert pandas DataFrame with template-matches to frame matches collection."""

    # Get path-hash pairs for all matched files
    matched_files = set(tuple(entry) for entry in template_matches[["path", "hash"]].values)

    # Get matched files index (path,hash) => file id
    file_index = {}
    with pipeline.database.session_scope() as session:
        for chunk in chunks(matched_files, size=10 ** 4):
            files = session.query(Files).filter(tuple_(Files.file_path, Files.sha256).in_(chunk)).all()
            for file in files:
                file_index[(file.file_path, file.sha256)] = file.id

    results = []
    for path, hash, record in template_matches.values:
        results.append(
            dict(
                file_id=file_index[(path, hash)],
                start_ms=record["start_ms"],
                end_ms=record["end_ms"],
            )
        )
    return results
