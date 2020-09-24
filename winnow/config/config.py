from typing import List

import yaml
from dataclasses import dataclass, asdict, field


@dataclass
class SourcesConfig:
    """Configuration of source file location."""
    root: str = None  # Root folder of the video files
    extensions: List[str] = ("mp4", "ogv", "webm", "avi")


@dataclass
class RepresentationConfig:
    """Configuration of intermediate representation storage."""
    directory: str = None  # Root folder with intermediate representations


@dataclass
class DatabaseConfig:
    """Configuration for database result storage."""
    use: bool = True
    uri: str = "postgres://postgres:admin@postgres:5432/videodeduplicationdb"


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


@dataclass
class TemplatesConfig:
    """Configuration for template matching."""
    source_path: str = None


@dataclass
class Config:
    """Root application configuration."""
    sources: SourcesConfig = field(default_factory=SourcesConfig)
    repr: RepresentationConfig = field(default_factory=RepresentationConfig)
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    processing: ProcessingConfig = field(default_factory=ProcessingConfig)
    templates: TemplatesConfig = field(default_factory=TemplatesConfig)

    @property
    def proc(self):
        """Short name for processing."""
        return self.processing

    @staticmethod
    def fromdict(data):
        """Build config from dict."""
        database = DatabaseConfig(**data.pop("database", {}))
        rep = RepresentationConfig(**data.pop("repr", {}))
        sources = SourcesConfig(**data.pop("sources", {}))
        templates = TemplatesConfig(**data.pop("templates", {}))
        processing = ProcessingConfig(**data.pop("processing", {}))
        return Config(database=database, processing=processing, repr=rep, sources=sources, templates=templates)

    @staticmethod
    def read(path):
        """Read config from YAML file."""
        with open(path, 'r') as file:
            data = yaml.load(file, Loader=yaml.FullLoader)
            return Config.fromdict(data)

    def save(self, path):
        """Save config to YAML file."""
        with open(path, 'w+') as file:
            self.dump(file)

    def dump(self, file):
        """Dump config to file-like object."""
        data = asdict(self)
        yaml.dump(data, file)
