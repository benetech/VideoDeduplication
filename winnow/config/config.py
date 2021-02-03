import os
from typing import Tuple

import yaml
from dataclasses import dataclass, asdict, field


def _bool_env(variable_name, default):
    """Parse boolean environment variable."""
    if variable_name not in os.environ:
        return default
    return os.environ[variable_name].lower() == "true"


@dataclass
class SourcesConfig:
    """Configuration of source file location."""

    root: str = None  # Root folder of the video files
    extensions: Tuple[str] = ("mp4", "ogv", "webm", "avi")

    def read_env(self):
        """Read config from environment variables."""
        self.root = os.environ.get("WINNOW_SOURCES_ROOT", self.root)
        if "WINNOW_SOURCES_EXTENSIONS" in os.environ:
            self.extensions = tuple(map(str.strip, os.environ["WINNOW_SOURCES_EXTENSIONS"].lower().split(",")))


@dataclass
class RepresentationConfig:
    """Configuration of intermediate representation storage."""

    directory: str = None  # Root folder with intermediate representations

    def read_env(self):
        """Read config from environment variables."""
        self.directory = os.environ.get("WINNOW_REPR_DIRECTORY", self.directory)


@dataclass
class DatabaseConfig:
    """Configuration for database result storage."""

    use: bool = True
    uri: str = "postgres://postgres:admin@postgres:5432/videodeduplicationdb"

    def read_env(self):
        """Read config from environment variables."""
        self.use = _bool_env("WINNOW_DB_USE", self.use)
        self.uri = os.environ.get("WINNOW_DB_URI", self.uri)


@dataclass
class ProcessingConfig:
    """Configuration for processing routine."""

    video_list_filename: str = None
    match_distance: float = 0.75
    filter_dark_videos: bool = True
    filter_dark_videos_thr: int = 2
    min_video_duration_seconds: int = 3
    detect_scenes: bool = True
    pretrained_model_local_path: str = None
    frame_sampling: int = 1
    save_frames: bool = True
    keep_fileoutput: bool = True

    def read_env(self):
        """Read config from environment variables."""
        self.video_list_filename = os.environ.get("WINNOW_PROC_VIDEO_LIST_FILE", self.video_list_filename)
        self.match_distance = float(os.environ.get("WINNOW_PROC_MATCH_DISTANCE", self.match_distance))
        self.filter_dark_videos = _bool_env("WINNOW_PROC_FILTER_DARK", self.filter_dark_videos)
        self.filter_dark_videos_thr = int(os.environ.get("WINNOW_PROC_FILTER_DARK_THR", self.filter_dark_videos_thr))
        self.min_video_duration_seconds = int(os.environ.get("WINNOW_PROC_MIN_DUR", self.min_video_duration_seconds))
        self.detect_scenes = _bool_env("WINNOW_PROC_DETECT_SCENES", self.detect_scenes)
        self.pretrained_model_local_path = os.environ.get("WINNOW_PROC_MODEL_PATH", self.pretrained_model_local_path)
        self.frame_sampling = int(os.environ.get("WINNOW_PROC_FRAME_SAMPLING", self.frame_sampling))
        self.save_frames = _bool_env("WINNOW_PROC_SAVE_FRAMES", self.save_frames)
        self.keep_fileoutput = _bool_env("WINNOW_PROC_KEEP_FILEOUTPUT", self.keep_fileoutput)


@dataclass
class TemplatesConfig:
    """Configuration for template matching."""

    source_path: str = None

    def read_env(self):
        """Read config from environment variables."""
        self.source_path = os.environ.get("WINNOW_TEMPLATE_SOURCE_PATH", self.source_path)


@dataclass
class SecurityConfig:
    """Configuration for credentials storage."""

    master_key_path: str = None

    def read_env(self):
        """Read config from environment variables."""
        self.master_key_path = os.environ.get("WINNOW_MASTER_KEY_PATH", self.master_key_path)


@dataclass
class Config:
    """Root application configuration."""

    sources: SourcesConfig = field(default_factory=SourcesConfig)
    repr: RepresentationConfig = field(default_factory=RepresentationConfig)
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    processing: ProcessingConfig = field(default_factory=ProcessingConfig)
    templates: TemplatesConfig = field(default_factory=TemplatesConfig)
    security: SecurityConfig = field(default=SecurityConfig)

    @property
    def proc(self):
        """Short name for processing."""
        return self.processing

    @property
    def save_files(self):
        """Derived option value for keeping csv files."""
        return self.proc.keep_fileoutput or not self.database.use

    @staticmethod
    def fromdict(data):
        """Build config from dict."""
        database = DatabaseConfig(**data.pop("database", {}))
        rep = RepresentationConfig(**data.pop("repr", {}))
        sources = SourcesConfig(**data.pop("sources", {}))
        templates = TemplatesConfig(**data.pop("templates", {}))
        processing = ProcessingConfig(**data.pop("processing", {}))
        security = SecurityConfig(**data.pop("security", {}))
        return Config(
            database=database,
            processing=processing,
            repr=rep,
            sources=sources,
            templates=templates,
            security=security,
        )

    @staticmethod
    def read(path):
        """Read config from YAML file."""
        with open(path, "r") as file:
            data = yaml.load(file, Loader=yaml.FullLoader)
            return Config.fromdict(data)

    def save(self, path):
        """Save config to YAML file."""
        with open(path, "w+") as file:
            self.dump(file)

    def dump(self, file):
        """Dump config to file-like object."""
        data = asdict(self)
        yaml.dump(data, file)

    def read_env(self):
        """Read config from environment variables."""
        self.sources.read_env()
        self.repr.read_env()
        self.database.read_env()
        self.processing.read_env()
        self.templates.read_env()
        self.security.read_env()
