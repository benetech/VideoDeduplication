import os
import time
from numbers import Number
from pathlib import Path
from typing import Optional, List, Dict

from celery.utils.log import get_task_logger

from db.access.templates import TemplatesDAO
from db.schema import Template, Files
from .progress_monitor import make_progress_monitor
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
    from winnow.utils.config import resolve_config
    from winnow.utils.files import scan_videos
    from winnow.pipeline.extract_exif import extract_exif
    from winnow.pipeline.detect_scenes import detect_scenes
    from winnow.pipeline.generate_local_matches import generate_local_matches
    from winnow.pipeline.pipeline_context import PipelineContext
    from winnow.utils.files import get_hash

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

    # Resolve list of video files from the directory
    logger.info(f"Resolving video list for directory {directory}")

    absolute_root = os.path.abspath(config.sources.root)
    absolute_dir = os.path.abspath(os.path.join(absolute_root, directory))
    if Path(config.sources.root) not in Path(absolute_dir).parents and absolute_root != absolute_dir:
        raise ValueError(f"Directory '{directory}' is outside of content root folder '{config.sources.root}'")

    videos = scan_videos(absolute_dir, "**", extensions=config.sources.extensions)
    hashes = [get_hash(file, config.repr.hash_mode) for file in videos]

    # Run pipeline
    monitor.update(0)
    pipeline_context = PipelineContext(config)
    generate_local_matches(
        files=videos, pipeline=pipeline_context, hashes=hashes, progress=monitor.subtask(work_amount=0.9)
    )
    detect_scenes(files=videos, pipeline=pipeline_context, progress=monitor.subtask(0.01))
    extract_exif(videos, pipeline_context, progress_monitor=monitor.subtask(work_amount=0.05))

    monitor.complete()


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
    from winnow.utils.config import resolve_config
    from winnow.utils.files import scan_videos
    from winnow.pipeline.extract_exif import extract_exif
    from winnow.pipeline.match_templates import match_templates
    from winnow.pipeline.pipeline_context import PipelineContext

    # Initialize a progress monitor
    monitor = make_progress_monitor(task=self, total_work=1.0)

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config(
        frame_sampling=frame_sampling,
        save_frames=save_frames,
        templates_distance=template_distance,
        templates_distance_min=template_distance_min,
        filter_dark=filter_dark,
        dark_threshold=dark_threshold,
        extensions=extensions,
        match_distance=match_distance,
        min_duration=min_duration,
    )

    # Make sure templates are loaded from the database
    config.templates.source_path = None
    config.database.use = True

    # Resolve list of video files from the directory
    directory = "."  # dataset root
    logger.info(f"Resolving video list for directory {directory}")
    absolute_root = os.path.abspath(config.sources.root)
    absolute_dir = os.path.abspath(os.path.join(absolute_root, directory))
    if Path(config.sources.root) not in Path(absolute_dir).parents and absolute_root != absolute_dir:
        raise ValueError(f"Directory '{directory}' is outside of content root folder '{config.sources.root}'")

    videos = scan_videos(absolute_dir, "**", extensions=config.sources.extensions)

    # Run pipeline
    monitor.update(0)
    pipeline_context = PipelineContext(config)
    extract_exif(videos, pipeline_context, progress_monitor=monitor.subtask(work_amount=0.1))
    match_templates(videos, pipeline_context, progress=monitor.subtask(work_amount=0.9))

    # Fetch matched file counts
    database = pipeline_context.database
    with database.session_scope() as session:
        templates = session.query(Template)
        raw_counts = TemplatesDAO.query_file_counts(session, templates)
        file_counts = [{"template": template_id, "file_count": count} for template_id, count in raw_counts.items()]

    monitor.complete()

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
    from winnow.utils.config import resolve_config
    from winnow.utils.files import scan_videos
    from winnow.pipeline.pipeline_context import PipelineContext
    from winnow.pipeline.find_frame import find_frame
    from winnow.search_engine.model import Frame
    from .frame_matches import get_frame_matches

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
        templates_distance=template_distance,
        templates_distance_min=template_distance_min,
    )
    config.database.use = True

    # Resolve list of video files from the directory
    logger.info(f"Resolving video list for directory {directory}")

    absolute_root = os.path.abspath(config.sources.root)
    absolute_dir = os.path.abspath(os.path.join(absolute_root, directory))
    if Path(config.sources.root) not in Path(absolute_dir).parents and absolute_root != absolute_dir:
        raise ValueError(f"Directory '{directory}' is outside of content root folder '{config.sources.root}'")

    videos = scan_videos(absolute_dir, "**", extensions=config.sources.extensions)

    # Run pipeline
    monitor.update(0)
    pipeline_context = PipelineContext(config)

    with pipeline_context.database.session_scope() as session:
        file = session.query(Files).filter(Files.id == file_id).one()
        storage_root = pipeline_context.config.sources.root
        file_path = os.path.join(storage_root, file.file_path)

    matches = find_frame(
        frame=Frame(path=file_path, time=frame_time_millis),
        files=videos,
        pipeline=pipeline_context,
        progress=monitor.subtask(work_amount=1.0),
    )

    monitor.complete()
    return {"matches": get_frame_matches(matches, pipeline_context)}


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


def fibo(n):
    """A very inefficient Fibonacci numbers generator."""
    if n <= 2:
        return 1
    return fibo(n - 1) + fibo(n - 2)


@winnow_task(bind=True)
def test_fibonacci(self, n, delay):
    # Initialize a progress monitor
    monitor = make_progress_monitor(task=self, total_work=n)
    for step in range(n):
        time.sleep(delay)
        logger.info(f"Step #{step} of {n}")
        monitor.increase(1)
