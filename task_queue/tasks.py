import json
import os
import shutil
import tempfile
import time
from typing import List, Dict

from celery.utils.log import get_task_logger

from db.access.templates import TemplatesDAO
from db.schema import Template, Files, Repository
from .winnow_task import winnow_task

logger = get_task_logger(__name__)


@winnow_task(bind=True)
def process_directory(self, directory: str, **config_overrides):
    """Perform basic directory processing: extract exif + match files."""
    from .luigi_support import luigi_config, run_luigi
    from winnow.pipeline.luigi.matches import MatchesTask
    from winnow.pipeline.luigi.exif import ExifTask
    from winnow.pipeline.luigi.scenes import ScenesTask

    with luigi_config(celery_task=self, **config_overrides) as config:
        match_files = MatchesTask(config=config, needles_prefix=directory)
        extract_exif = ExifTask(config=config, prefix=directory)
        detect_scenes = ScenesTask(config=config, prefix=directory)
        run_luigi(match_files, extract_exif, detect_scenes)


@winnow_task(bind=True)
def process_file_list(**_):
    """The task was not hooked up in the UI."""
    raise NotImplementedError("Process file list task is not implemented.")


@winnow_task(bind=True)
def match_all_templates(self, **config_overrides) -> Dict:
    """Match all templates."""
    from .luigi_support import luigi_pipeline, run_luigi
    from winnow.pipeline.luigi.templates import DBTemplateMatchesTask

    with luigi_pipeline(celery_task=self, **config_overrides) as pipeline:
        run_luigi(DBTemplateMatchesTask(config=pipeline.config, prefix="."))

        database = pipeline.database
        with database.session_scope() as session:
            templates = session.query(Template)
            raw_counts = TemplatesDAO.query_file_counts(session, templates)
            file_counts = [{"template": template_id, "file_count": count} for template_id, count in raw_counts.items()]

        return {"file_counts": file_counts}


@winnow_task(bind=True)
def find_frame_task(self, file_id: int, frame_time_millis: int, directory: str = ".", **config_overrides):
    """Find similar frames among other videos."""
    from .luigi_support import luigi_pipeline, run_luigi
    from winnow.pipeline.luigi.find_frame import FindFrameTask

    with luigi_pipeline(celery_task=self, **config_overrides) as pipeline:
        # Fetch file details by id
        with pipeline.database.session_scope(expunge=True) as session:
            file = session.query(Files).filter(Files.id == file_id).one()

        # Write frame-search report to the temporary file
        with tempfile.TemporaryDirectory(prefix="file-storage-") as output_directory:
            result_path = os.path.join(output_directory, "found_frames.json")
            find_frame = FindFrameTask(
                config=pipeline.config,
                frame_video_path=file.file_path,
                frame_time_millis=float(frame_time_millis),
                among_files_prefix=directory,
                output_path=result_path,
            )
            run_luigi(find_frame)

            # Read the matches from the temporary report-file
            with open(result_path, "r") as result_file:
                matches = json.load(result_file)

        return {"matches": matches}


@winnow_task(bind=True)
def process_online_video(self, urls: List[str], destination_template: str, **config_overrides):
    """Download online videos and perform basic processing."""
    from .luigi_support import luigi_pipeline, run_luigi
    from winnow.pipeline.luigi.download import DownloadFilesTask

    with luigi_pipeline(celery_task=self, **config_overrides) as pipeline:
        download_task = DownloadFilesTask(config=pipeline.config, urls=urls, destination_template=destination_template)
        file_paths = download_task.output().remaining_coll_paths
        run_luigi(download_task)

        # Prepare task results
        with pipeline.database.session_scope() as session:
            files = session.query(Files).filter(Files.file_path.in_(file_paths)).all()
            result = {"files": [{"id": file.id, "path": file.file_path} for file in files]}

        return result


@winnow_task(bind=True)
def push_fingerprints_task(self, repository_id: int):
    """Push local fingerprints to remote repository."""
    from .luigi_support import luigi_pipeline, run_luigi
    from winnow.pipeline.luigi.remote_fingerprints import PushFingerprintsTask

    with luigi_pipeline(celery_task=self) as pipeline:
        # Fetch repository to determine repository name by id
        with pipeline.database.session_scope(expunge=True) as session:
            repository: Repository = session.query(Repository).filter(Repository.id == repository_id).one()
        # Push local fingerprints to remote repository
        run_luigi(PushFingerprintsTask(config=pipeline.config, repository_name=repository.name))


@winnow_task(bind=True)
def pull_fingerprints_task(self, repository_id: int):
    from .luigi_support import luigi_pipeline, run_luigi
    from winnow.pipeline.luigi.remote_fingerprints import PullFingerprintsTask

    with luigi_pipeline(celery_task=self) as pipeline:
        # Fetch repository to determine repository name by id
        with pipeline.database.session_scope(expunge=True) as session:
            repository: Repository = session.query(Repository).filter(Repository.id == repository_id).one()
        # Pull remote fingerprints
        run_luigi(PullFingerprintsTask(config=pipeline.config, repository_name=repository.name))


@winnow_task(bind=True)
def match_remote_fingerprints(self, repository_id: int = None, **_):
    """Match fingerprints from the given remote repository with the local fingerprints."""
    from .luigi_support import luigi_pipeline, run_luigi
    from winnow.pipeline.luigi.matches import RemoteMatchesTask

    with luigi_pipeline(celery_task=self) as pipeline:
        # Determine repository name by ID
        with pipeline.database.session_scope() as session:
            repo: Repository = session.query(Repository).filter(Repository.id == repository_id).one()
            repository_name = repo.name

        run_luigi(RemoteMatchesTask(config=pipeline.config, repository_name=repository_name, haystack_prefix="."))


@winnow_task(bind=True)
def prepare_semantic_search(self, **_):
    """Prepare semantic search model."""
    from .luigi_support import luigi_config, run_luigi
    from winnow.pipeline.luigi.text_search import PrepareTextSearchTask

    with luigi_config(celery_task=self) as config:
        run_luigi(PrepareTextSearchTask(config=config))


@winnow_task(bind=True)
def generate_tiles(self, algorithm: str, max_zoom: int = 8, force: bool = False, **_):
    """Prepare semantic search model."""
    from .luigi_support import luigi_config, run_luigi
    from winnow.pipeline.luigi.embeddings_tiles import (
        TriMAPTilesTask,
        PaCMAPTilesTask,
        UMAPTilesTask,
        TSNETilesTask,
    )
    from winnow.pipeline.luigi.embeddings_annoy_index import (
        PaCMAPAnnoyIndexTask,
        TriMAPAnnoyIndexTask,
        TSNEAnnoyIndexTask,
        UMAPAnnoyIndexTask,
    )

    if max_zoom < 0:
        raise ValueError(f"Negative max_zoom: {max_zoom}")

    with luigi_config(celery_task=self) as config:
        if algorithm == "pacmap":
            tiles_task = PaCMAPTilesTask(config=config, max_zoom=max_zoom, clean_existing=True)
            index_task = PaCMAPAnnoyIndexTask(config=config)
        elif algorithm == "trimap":
            tiles_task = TriMAPTilesTask(config=config, max_zoom=max_zoom, clean_existing=True)
            index_task = TriMAPAnnoyIndexTask(config=config)
        elif algorithm == "umap":
            tiles_task = UMAPTilesTask(config=config, max_zoom=max_zoom, clean_existing=True)
            index_task = UMAPAnnoyIndexTask(config=config)
        elif algorithm == "t-sne":
            tiles_task = TSNETilesTask(config=config, max_zoom=max_zoom, clean_existing=True)
            index_task = TSNEAnnoyIndexTask(config=config)
        else:
            raise ValueError(f"Unknown embeddings algorithm: {algorithm}")

        existing_tiles_path = tiles_task.output().latest_result_path
        if force and existing_tiles_path is not None:
            shutil.rmtree(existing_tiles_path)
        run_luigi(tiles_task, index_task)


def fibo(n):
    """A very inefficient Fibonacci numbers generator."""
    if n <= 2:
        return 1
    return fibo(n - 1) + fibo(n - 2)


@winnow_task(bind=True)
def test_fibonacci(self, n, delay):
    from .progress_monitor import make_progress_monitor

    # Initialize a progress monitor
    monitor = make_progress_monitor(task=self, total_work=n)
    for step in range(n):
        time.sleep(delay)
        logger.info(f"Step #{step} of {n}")
        monitor.increase(1)
