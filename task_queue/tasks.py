import json
import os
import tempfile
import time
from numbers import Number
from typing import Optional, List, Dict

from celery.utils.log import get_task_logger

from db.access.templates import TemplatesDAO
from db.schema import Template, Files, Repository
from .winnow_task import winnow_task

logger = get_task_logger(__name__)


@winnow_task(bind=True)
def process_directory(
    self,
    directory: str,
    save_frames: Optional[int] = None,
    frame_sampling: Optional[int] = None,
    filter_dark: Optional[bool] = None,
    dark_threshold: Optional[Number] = None,
    extensions: Optional[List[str]] = None,
    match_distance: Optional[float] = None,
    min_duration: Optional[Number] = None,
):
    from .luigi_support import LuigiRootProgressMonitor, run_luigi
    from winnow.pipeline.luigi.matches import DBMatchesTask
    from winnow.pipeline.luigi.exif import ExifTask
    from winnow.utils.config import resolve_config

    # Initialize a progress monitor
    progress = LuigiRootProgressMonitor(celery_task=self)

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config(
        frame_sampling=frame_sampling,
        save_frames=save_frames,
        filter_dark=filter_dark,
        dark_threshold=dark_threshold,
        extensions=extensions,
        match_distance=match_distance,
        min_duration=min_duration,
    )
    config.database.use = True

    run_luigi(
        DBMatchesTask(config=config, needles_prefix=directory),
        ExifTask(config=config, prefix=directory),
    )
    progress.complete()


@winnow_task(bind=True)
def process_file_list(
    self,
    files: List[str],
    save_frames: Optional[int] = None,
    frame_sampling: Optional[int] = None,
    filter_dark: Optional[bool] = None,
    dark_threshold: Optional[Number] = None,
    extensions: Optional[List[str]] = None,
    match_distance: Optional[float] = None,
    min_duration: Optional[Number] = None,
):
    from .progress_monitor import make_progress_monitor
    from winnow.utils.config import resolve_config
    from winnow.utils.files import get_hash
    from winnow.pipeline.extract_exif import extract_exif
    from winnow.pipeline.detect_scenes import detect_scenes
    from winnow.pipeline.generate_local_matches import generate_local_matches
    from winnow.pipeline.pipeline_context import PipelineContext

    # Initialize a progress monitor
    monitor = make_progress_monitor(task=self, total_work=1.0)

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config(
        frame_sampling=frame_sampling,
        save_frames=save_frames,
        filter_dark=filter_dark,
        dark_threshold=dark_threshold,
        extensions=extensions,
        match_distance=match_distance,
        min_duration=min_duration,
    )
    config.database.use = True

    # Run pipeline
    monitor.update(0)
    pipeline_context = PipelineContext(config)
    hashes = [get_hash(file, config.repr.hash_mode) for file in files]
    generate_local_matches(files, pipeline=pipeline_context, hashes=hashes, progress=monitor.subtask(work_amount=0.9))
    detect_scenes(files, pipeline=pipeline_context, progress=monitor.subtask(0.01))
    extract_exif(files, pipeline_context, progress_monitor=monitor.subtask(work_amount=0.05))

    monitor.complete()


@winnow_task(bind=True)
def match_all_templates(
    self,
    save_frames: Optional[int] = None,
    frame_sampling: Optional[int] = None,
    filter_dark: Optional[bool] = None,
    dark_threshold: Optional[Number] = None,
    extensions: Optional[List[str]] = None,
    match_distance: Optional[float] = None,
    template_distance: Optional[float] = None,
    template_distance_min: Optional[float] = None,
    min_duration: Optional[Number] = None,
) -> Dict:
    from winnow.pipeline.pipeline_context import PipelineContext
    from .luigi_support import LuigiRootProgressMonitor, run_luigi
    from winnow.pipeline.luigi.templates import DBTemplateMatchesTask
    from winnow.utils.config import resolve_config

    # Initialize a progress monitor
    progress = LuigiRootProgressMonitor(celery_task=self)

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config(
        frame_sampling=frame_sampling,
        save_frames=save_frames,
        filter_dark=filter_dark,
        templates_distance=template_distance,
        templates_distance_min=template_distance_min,
        dark_threshold=dark_threshold,
        extensions=extensions,
        match_distance=match_distance,
        min_duration=min_duration,
    )
    config.database.use = True
    logger.info("Loaded config: %s", config)

    run_luigi(DBTemplateMatchesTask(config=config, prefix="."))

    # Fetch matched file counts
    pipeline = PipelineContext(config)
    database = pipeline.database
    with database.session_scope() as session:
        templates = session.query(Template)
        raw_counts = TemplatesDAO.query_file_counts(session, templates)
        file_counts = [{"template": template_id, "file_count": count} for template_id, count in raw_counts.items()]

    progress.complete()
    return {"file_counts": file_counts}


@winnow_task(bind=True)
def find_frame_task(
    self,
    file_id: int,
    frame_time_millis: int,
    directory: str = ".",
    template_distance: Optional[float] = None,
    template_distance_min: Optional[float] = None,
    save_frames: Optional[int] = None,
    frame_sampling: Optional[int] = None,
    filter_dark: Optional[bool] = None,
    dark_threshold: Optional[Number] = None,
    extensions: Optional[List[str]] = None,
    match_distance: Optional[float] = None,
    min_duration: Optional[Number] = None,
):
    from winnow.pipeline.pipeline_context import PipelineContext
    from .luigi_support import LuigiRootProgressMonitor, run_luigi
    from winnow.pipeline.luigi.find_frame import FindFrameTask
    from winnow.utils.config import resolve_config

    # Initialize a progress monitor
    progress = LuigiRootProgressMonitor(celery_task=self)

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config(
        frame_sampling=frame_sampling,
        save_frames=save_frames,
        filter_dark=filter_dark,
        templates_distance=template_distance,
        templates_distance_min=template_distance_min,
        dark_threshold=dark_threshold,
        extensions=extensions,
        match_distance=match_distance,
        min_duration=min_duration,
    )
    config.database.use = True
    pipeline = PipelineContext(config)
    logger.info("Loaded config: %s", config)

    with pipeline.database.session_scope(expunge=True) as session:
        file = session.query(Files).filter(Files.id == file_id).one()

    with tempfile.TemporaryDirectory(prefix="file-storage-") as output_directory:
        result_path = os.path.join(output_directory, "found_frames.json")
        find_frame = FindFrameTask(
            config=config,
            frame_video_path=file.file_path,
            frame_time_millis=float(frame_time_millis),
            among_files_prefix=directory,
            output_path=result_path,
        )
        run_luigi(find_frame)
        with open(result_path, "r") as result_file:
            matches = json.load(result_file)

    progress.complete()
    return {"matches": matches}


@winnow_task(bind=True)
def process_online_video(
    self,
    urls: List[str],
    destination_template: str,
    save_frames: Optional[int] = None,
    frame_sampling: Optional[int] = None,
    filter_dark: Optional[bool] = None,
    dark_threshold: Optional[Number] = None,
    extensions: Optional[List[str]] = None,
    match_distance: Optional[float] = None,
    min_duration: Optional[Number] = None,
):
    from .progress_monitor import make_progress_monitor
    from winnow.utils.config import resolve_config
    from winnow.pipeline.pipeline_context import PipelineContext
    from winnow.pipeline.process_urls import process_urls

    # Initialize a progress monitor
    monitor = make_progress_monitor(task=self, total_work=1.0)

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config(
        frame_sampling=frame_sampling,
        save_frames=save_frames,
        filter_dark=filter_dark,
        dark_threshold=dark_threshold,
        extensions=extensions,
        match_distance=match_distance,
        min_duration=min_duration,
    )
    config.database.use = True

    # Run pipeline
    monitor.update(0)
    pipeline_context = PipelineContext(config)
    file_paths = process_urls(
        urls=urls,
        destination_template=destination_template,
        pipeline=pipeline_context,
        progress=monitor,
    )

    with pipeline_context.database.session_scope() as session:
        store_paths = tuple(pipeline_context.storepath(path) for path in file_paths)
        files = session.query(Files).filter(Files.file_path.in_(store_paths)).all()
        result = {"files": [{"id": file.id, "path": file.file_path} for file in files]}

    monitor.complete()
    return result


@winnow_task(bind=True)
def push_fingerprints_task(
    self,
    repository_id: int,
):
    from .luigi_support import LuigiRootProgressMonitor, run_luigi
    from winnow.pipeline.luigi.remote_fingerprints import PushFingerprintsTask
    from winnow.pipeline.pipeline_context import PipelineContext
    from winnow.utils.config import resolve_config

    # Initialize a progress monitor
    progress = LuigiRootProgressMonitor(celery_task=self)

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config()
    config.database.use = True
    pipeline = PipelineContext(config)
    logger.info("Loaded config: %s", config)

    with pipeline.database.session_scope(expunge=True) as session:
        repository: Repository = session.query(Repository).filter(Repository.id == repository_id).one()

    run_luigi(PushFingerprintsTask(config_path=config_path, repository_name=repository.name))
    progress.complete()


@winnow_task(bind=True)
def pull_fingerprints_task(
    self,
    repository_id: int,
):
    from .luigi_support import LuigiRootProgressMonitor, run_luigi
    from winnow.pipeline.luigi.remote_fingerprints import PullFingerprintsTask
    from winnow.pipeline.pipeline_context import PipelineContext
    from winnow.utils.config import resolve_config

    # Initialize a progress monitor
    progress = LuigiRootProgressMonitor(celery_task=self)

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config()
    config.database.use = True
    pipeline = PipelineContext(config)
    logger.info("Loaded config: %s", config)

    with pipeline.database.session_scope(expunge=True) as session:
        repository: Repository = session.query(Repository).filter(Repository.id == repository_id).one()

    run_luigi(PullFingerprintsTask(config=config, repository_name=repository.name))
    progress.complete()


@winnow_task(bind=True)
def match_remote_fingerprints(
    self,
    repository_id: int = None,
    contributor_name: str = None,
):
    from .luigi_support import LuigiRootProgressMonitor, run_luigi
    from winnow.pipeline.pipeline_context import PipelineContext
    from winnow.utils.config import resolve_config
    from winnow.pipeline.luigi.matches import RemoteMatchesTask

    # Initialize a progress monitor
    progress = LuigiRootProgressMonitor(celery_task=self)

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config()
    config.database.use = True
    pipeline = PipelineContext(config)
    logger.info("Loaded config: %s", config)

    with pipeline.database.session_scope() as session:
        repo = session.query(Repository).filter(Repository.id == repository_id).one()
        repository_name = repo.name

    run_luigi(RemoteMatchesTask(config=config, repository_name=repository_name, haystack_prefix="."))
    progress.complete()


@winnow_task(bind=True)
def prepare_semantic_search(self, force: bool = True):
    from .luigi_support import LuigiRootProgressMonitor, run_luigi
    from winnow.pipeline.luigi.text_search import PrepareTextSearchTask
    from winnow.utils.config import resolve_config

    # Initialize a progress monitor
    progress = LuigiRootProgressMonitor(celery_task=self)

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config()
    config.database.use = True
    logger.info("Loaded config: %s", config)

    run_luigi(PrepareTextSearchTask(config=config))
    progress.complete()


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
