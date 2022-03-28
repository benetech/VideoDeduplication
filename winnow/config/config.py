import enum
import io
import logging
import os
from typing import Tuple, Dict, Type, Any, Optional

import yaml
from dataclasses import dataclass, asdict, field


def _bool_env(variable_name, default):
    """Parse boolean environment variable."""
    if variable_name not in os.environ:
        return default
    return os.environ[variable_name].lower() == "true"


def _parse_enum(enum_cls: Type[enum.Enum], value: Any, default: Any = None):
    """Parse enum value."""
    if value is None:
        return default
    if isinstance(value, enum_cls):
        return value
    if isinstance(value, str):
        return enum_cls(value.lower().strip())
    return enum_cls(value)


def _parse_enum_name(enum_cls: Type[enum.Enum], name: Optional[str], default: Any = None):
    """Parse enum by name."""
    if name is None:
        return default
    try:
        return enum_cls[name]
    except KeyError:
        raise ValueError(f"{name} is not a valid {enum_cls.__name__} name.")


class HashMode(enum.Enum):
    """Supported hash modes."""

    FILE = "file"
    PATH = "path"
    PATH_MTIME = "path+mtime"

    @staticmethod
    def parse(value, default=None):
        """Create a HashMode described by the given value."""
        return _parse_enum(HashMode, value, default)


class StorageType(enum.Enum):
    """Supported storage types."""

    DETECT = "detect"
    LMDB = "lmdb"
    SIMPLE = "simple"
    SQLITE = "sqlite"
    NOHASH = "nohash"

    @staticmethod
    def parse(value, default=None):
        """Create a StorageType described by the given value."""
        return _parse_enum(StorageType, value, default)


@dataclass
class SourcesConfig:
    """Configuration of source file location."""

    root: str = None  # Root folder of the video files
    extensions: Tuple[str] = ("mp4", "ogv", "webm", "avi")
    hash_mode: HashMode = HashMode.FILE
    hash_cache: Optional[str] = None

    def read_env(self):
        """Read config from environment variables."""
        self.root = os.environ.get("WINNOW_SOURCES_ROOT", self.root)
        if "WINNOW_SOURCES_EXTENSIONS" in os.environ:
            self.extensions = tuple(map(str.strip, os.environ["WINNOW_SOURCES_EXTENSIONS"].lower().split(",")))
        self.hash_mode = HashMode.parse(os.environ.get("WINNOW_REPR_HASH_MODE", self.hash_mode))
        self.hash_cache = os.environ.get("WINNOW_SOURCES_HASH_CACHE_PATH", self.hash_cache)


@dataclass
class RepresentationConfig:
    """Configuration of intermediate representation storage."""

    directory: str = None  # Root folder with intermediate representations
    storage_type: StorageType = StorageType.LMDB  # Specify representation storage type

    def read_env(self):
        """Read config from environment variables."""
        self.directory = os.environ.get("WINNOW_REPR_DIRECTORY", self.directory)
        self.storage_type = StorageType.parse(os.environ.get("WINNOW_REPR_STORAGE_TYPE", self.storage_type))

    @staticmethod
    def fromdict(data: Dict):
        """Construct repr config from dict data."""
        result = RepresentationConfig(**data)
        result.storage_type = StorageType.parse(result.storage_type)
        return result


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
    minimum_scene_duration: int = 2
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
    distance: float = 0.07
    distance_min: float = 0.05
    override: bool = False  # Override template matches
    extensions: Tuple[str] = ("png", "jpg", "jpeg")

    def read_env(self):
        """Read config from environment variables."""
        self.source_path = os.environ.get("WINNOW_TEMPLATE_SOURCE_PATH", self.source_path)
        self.distance = float(os.environ.get("WINNOW_TEMPLATE_DISTANCE", self.distance))
        self.distance_min = float(os.environ.get("WINNOW_TEMPLATE_DISTANCE_MIN", self.distance_min))
        self.override = bool(os.environ.get("WINNOW_TEMPLATE_OVERRIDE", self.override))
        if "WINNOW_TEMPLATE_EXTENSIONS" in os.environ:
            extensions_env = os.environ["WINNOW_TEMPLATE_EXTENSIONS"].lower()
            self.extensions = tuple(map(str.strip, extensions_env.split(",")))


@dataclass
class SecurityConfig:
    """Configuration for credentials storage."""

    master_key_path: str = None

    def read_env(self):
        """Read config from environment variables."""
        self.master_key_path = os.environ.get("WINNOW_MASTER_KEY_PATH", self.master_key_path)


@dataclass
class FileStorageConfig:
    """Configuration for template examples storage."""

    directory: str = None

    def read_env(self):
        """Read config from environment variables."""
        self.directory = os.environ.get("WINNOW_FILE_STORAGE_DIRECTORY", self.directory)


class LogLevel(enum.Enum):
    """Predefined log levels."""

    CRITICAL = logging.CRITICAL
    FATAL = logging.FATAL
    ERROR = logging.ERROR
    WARNING = logging.WARNING
    INFO = logging.INFO
    DEBUG = logging.DEBUG
    NOTSET = logging.NOTSET

    @staticmethod
    def parse(name: Optional[str], default=WARNING):
        """Create a LogLevel described by the given name."""
        return _parse_enum_name(LogLevel, name, default)


@dataclass
class LoggingConfig:
    """Configuration for application logging."""

    file_path: str = "./processing_error.log"
    file_format: str = "[%(asctime)s: %(levelname)s] [%(name)s] %(message)s"
    file_level: LogLevel = LogLevel.ERROR
    console_format: str = "[%(asctime)s: %(levelname)s] %(message)s"
    console_level: LogLevel = LogLevel.INFO

    def read_env(self):
        """Read config from environment variables."""
        self.file_path = os.environ.get("WINNOW_LOG_FILE_PATH", self.file_path)
        self.file_format = os.environ.get("WINNOW_LOG_FILE_FORMAT", self.file_format)
        self.file_level = LogLevel.parse(os.environ.get("WINNOW_LOG_FILE_LEVEL", self.file_level.name))
        self.console_format = os.environ.get("WINNOW_LOG_CONSOLE_FORMAT", self.console_format)
        self.console_level = LogLevel.parse(os.environ.get("WINNOW_LOG_CONSOLE_LEVEL", self.console_level.name))


@dataclass
class Config:
    """Root application configuration."""

    sources: SourcesConfig = field(default_factory=SourcesConfig)
    repr: RepresentationConfig = field(default_factory=RepresentationConfig)
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    processing: ProcessingConfig = field(default_factory=ProcessingConfig)
    templates: TemplatesConfig = field(default_factory=TemplatesConfig)
    security: SecurityConfig = field(default_factory=SecurityConfig)
    file_storage: FileStorageConfig = field(default_factory=FileStorageConfig)
    logging: LoggingConfig = field(default_factory=LoggingConfig)

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
        rep = RepresentationConfig.fromdict(data.pop("repr", {}))
        sources = SourcesConfig(**data.pop("sources", {}))
        templates = TemplatesConfig(**data.pop("templates", {}))
        processing = ProcessingConfig(**data.pop("processing", {}))
        security = SecurityConfig(**data.pop("security", {}))
        file_storage = FileStorageConfig(**data.pop("file_storage", {}))
        logging_config = LoggingConfig(**data.pop("logging", {}))
        return Config(
            database=database,
            processing=processing,
            repr=rep,
            sources=sources,
            templates=templates,
            security=security,
            file_storage=file_storage,
            logging=logging_config,
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

    def dumps(self) -> str:
        """Dump config to string."""
        stream = io.StringIO()
        self.dump(stream)
        return stream.getvalue()

    def read_env(self):
        """Read config from environment variables."""
        self.sources.read_env()
        self.repr.read_env()
        self.database.read_env()
        self.processing.read_env()
        self.templates.read_env()
        self.security.read_env()
        self.file_storage.read_env()
        self.logging.read_env()
