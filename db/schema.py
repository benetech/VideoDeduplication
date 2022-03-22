import datetime
import enum

from sqlalchemy import (
    Column,
    String,
    Integer,
    LargeBinary,
    Boolean,
    Float,
    JSON,
    ForeignKey,
    UniqueConstraint,
    DateTime,
    event,
    CheckConstraint,
    Enum,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, object_session

Base = declarative_base()


class Files(Base):
    __tablename__ = "files"
    __table_args__ = (
        UniqueConstraint("file_path", "sha256", name="_file_uc"),
        # contributor_id and external_id are either both null (if the file is local)
        # or both not null (if the file is pulled from some remote repository).
        CheckConstraint(
            "(contributor_id IS NULL AND external_id IS NULL) OR "
            "(contributor_id IS NOT NULL AND external_id IS NOT NULL)"
        ),
    )

    id = Column(Integer, primary_key=True)
    created_date = Column(DateTime, default=datetime.datetime.utcnow)
    sha256 = Column(String)
    file_path = Column(String)

    # Remote fingerprints only attributes

    contributor_id = Column(Integer, ForeignKey("contributors.id"), nullable=True)
    external_id = Column(Integer, nullable=True)

    # Relationships

    signature = relationship("Signature", cascade="all,delete", uselist=False, back_populates="file")
    meta = relationship("VideoMetadata", cascade="all,delete", uselist=False, back_populates="file")
    scenes = relationship("Scene", cascade="all,delete", back_populates="file")
    template_matches = relationship("TemplateMatches", back_populates="file", cascade="all, delete-orphan")
    template_exclusions = relationship("TemplateFileExclusion", back_populates="file", cascade="all, delete-orphan")
    exif = relationship("Exif", cascade="all,delete", uselist=False, back_populates="file")

    # TODO: find a way to merge these two relationships
    #   (See https://github.com/benetech/VideoDeduplication/issues/141)
    source_matches = relationship(
        "Matches", back_populates="query_video_file", foreign_keys="Matches.query_video_file_id"
    )
    target_matches = relationship(
        "Matches", back_populates="match_video_file", foreign_keys="Matches.match_video_file_id"
    )

    contributor = relationship("Contributor", back_populates="files")


class Signature(Base):
    __tablename__ = "signatures"
    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), unique=True, nullable=False)
    file = relationship("Files", back_populates="signature")
    signature = Column(LargeBinary)


class VideoMetadata(Base):
    __tablename__ = "videometadata"

    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), unique=True, nullable=False)
    file = relationship("Files", back_populates="meta")
    gray_max = Column(Float)
    video_dark_flag = Column(Boolean)
    flagged = Column(Boolean)


class Scene(Base):
    __tablename__ = "scenes"
    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    file = relationship("Files", back_populates="scenes")
    duration = Column(Integer)
    start_time = Column(Integer)


# TODO: move to a separate module (#295)
class IconType(enum.Enum):
    """Enumeration for template icon types."""

    PREDEFINED = "predefined"
    CUSTOM = "custom"


class Template(Base):
    """Template descriptor."""

    __tablename__ = "templates"

    # Attributes

    id = Column(Integer, autoincrement=True, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    icon_type = Column(Enum(IconType), nullable=False, default=IconType.PREDEFINED)
    icon_key = Column(String, nullable=True, default="GiHealthNormal")

    # Relationships

    examples = relationship("TemplateExample", cascade="all,delete", back_populates="template")
    matches = relationship("TemplateMatches", cascade="all,delete", back_populates="template")
    file_exclusions = relationship("TemplateFileExclusion", cascade="all,delete", back_populates="template")


class TemplateExample(Base):
    """Example image to match, part of a template."""

    __tablename__ = "examples"

    # Attributes

    id = Column(Integer, autoincrement=True, primary_key=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)
    storage_key = Column(String, nullable=False)
    features = Column(LargeBinary)

    # Relationships

    template = relationship("Template", back_populates="examples")


class TemplateMatches(Base):
    __tablename__ = "templatematches"
    id = Column(Integer, autoincrement=True, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)
    start_ms = Column(Float)
    end_ms = Column(Float)
    # Mean distance of the sequence (start -> end)
    mean_distance_sequence = Column(Float)
    # Min distance found in the whole video
    min_distance_video = Column(Float)
    # ms offset
    min_distance_ms = Column(Float)
    # Mark the object as false-positive match.
    false_positive = Column(Boolean, nullable=False, default=False)

    # Relationships

    file = relationship("Files", back_populates="template_matches")
    template = relationship("Template", back_populates="matches")


class TemplateFileExclusion(Base):
    """File excluded from the Template scope."""

    __tablename__ = "template_file_exclusion"
    __table_args__ = (UniqueConstraint("file_id", "template_id", name="_template_file_exclusion_uc"),)

    id = Column(Integer, autoincrement=True, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)

    # Relationships

    file = relationship("Files", back_populates="template_exclusions")
    template = relationship("Template", back_populates="file_exclusions")


@event.listens_for(TemplateFileExclusion, "after_insert")
def on_file_exclusion_insert(mapper, connection, exclusion: TemplateFileExclusion):
    """Delete unwanted objects when (template, file) pair is added to black list."""
    session = object_session(exclusion)
    session.query(TemplateMatches).filter(
        TemplateMatches.template_id == exclusion.template_id,
        TemplateMatches.file_id == exclusion.file_id,
    ).delete()


@event.listens_for(Files.template_matches, "remove")
def rem(state, item, initiator):
    sess = object_session(item)

    # ensure we have a session
    assert sess is not None

    # ensure the item is marked deleted.  the cascade
    # rule may have done so already but not always.
    sess.delete(item)

    # flush *just this one item*.  This is a special
    # feature of flush, not for general use.
    sess.flush([item])


class Matches(Base):
    __tablename__ = "matches"
    __table_args__ = (UniqueConstraint("query_video_file_id", "match_video_file_id", name="_matches_uc"),)

    id = Column(Integer, primary_key=True)
    query_video = Column(String)
    query_video_file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    query_video_file = relationship("Files", back_populates="source_matches", foreign_keys=[query_video_file_id])
    match_video = Column(String)
    match_video_file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    match_video_file = relationship("Files", back_populates="target_matches", foreign_keys=[match_video_file_id])
    distance = Column(Float, nullable=False)
    false_positive = Column(Boolean, nullable=False, default=False)


class Exif(Base):
    __tablename__ = "exif"

    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), unique=True, nullable=False)
    file = relationship("Files", back_populates="exif")

    General_FileExtension = Column(String)
    General_Format_Commercial = Column(String)
    General_FileSize = Column(Float)
    General_Duration = Column(Float)
    General_OverallBitRate_Mode = Column(String)
    General_OverallBitRate = Column(Float)
    General_FrameRate = Column(Float)
    General_FrameCount = Column(Float)
    General_Encoded_Date = Column(DateTime)
    General_File_Modified_Date = Column(DateTime)
    General_File_Modified_Date_Local = Column(DateTime)
    General_Tagged_Date = Column(DateTime)
    Video_Format = Column(String)
    Video_BitRate = Column(Float)
    Video_InternetMediaType = Column(String)
    Video_Width = Column(Float)
    Video_Height = Column(Float)
    Video_FrameRate = Column(Float)
    Audio_Format = Column(String)
    Audio_SamplingRate = Column(Float)
    Audio_Title = Column(String)
    Audio_BitRate = Column(Float)
    Audio_Channels = Column(Float)
    Audio_Duration = Column(Float)
    Audio_Encoded_Date = Column(DateTime)
    Audio_Tagged_Date = Column(DateTime)
    Json_full_exif = Column(JSON)


# TODO: move RepositoryType to a separate module (#295)
class RepositoryType(enum.Enum):
    """Repository type determines its access method.

    There might be different repository types (bare database, REST API, etc.),
    so we need a way to specify which supported access method should be used.
    """

    BARE_DATABASE = "BARE_DATABASE"


class Repository(Base):
    """Remote fingerprint repository."""

    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True)
    # Human-readable repository name which will be displayed by interface
    name = Column(String, nullable=False, unique=True)
    # Repository type determines how to access the repository
    repository_type = Column(Enum(RepositoryType), nullable=False, default=RepositoryType.BARE_DATABASE)
    # Address format may depend on repository type
    network_address = Column(String, nullable=False)
    # Account id or username which we use to access the repository
    account_id = Column(String, nullable=False)
    # Optional total fingerprint count
    total_fingerprint_count = Column(Integer, nullable=False, default=0)
    # Optional pushed fingerprint count
    pushed_fingerprint_count = Column(Integer, nullable=False, default=0)
    # Last synchronization time
    last_sync = Column(DateTime, nullable=True)

    # Relationships

    contributors = relationship("Contributor", cascade="all,delete", back_populates="repository")


class Contributor(Base):
    """An organization that contributed some fingerprints to the remote repository."""

    __tablename__ = "contributors"

    id = Column(Integer, primary_key=True)
    # Any identifier used in the corresponding repository to designate this contributor
    name = Column(String, nullable=False)
    # A repository from which this contributor is known
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    # Optional total count of fingerprints
    fingerprints_count = Column(Integer, nullable=False, default=0)

    # Relationships

    repository = relationship("Repository", back_populates="contributors")
    files = relationship("Files", cascade="all,delete", back_populates="contributor")


class FileFilterPreset(Base):
    """This is a way to store reusable file filtering presets."""

    __tablename__ = "file_filter_presets"

    id = Column(Integer, primary_key=True)
    # Any unique name for the preset
    name = Column(String(100), nullable=False, unique=True)
    # Any filter data as JSON blob
    filters = Column(JSON, nullable=False)


class TaskLogRecord(Base):
    """Task execution log.

    Motivation
    ----------
    Sometimes there is no way to determine whether the task is already completed just by looking
    at the results alone. For example if template-matching is performed and no matches was found
    there will be zero ``TemplateMatches`` in the database. So the results before and after the
    run will be identical. Thus, some indication that the task was successfully executed is
    needed. ``TaskLogRecord`` fills this gap.
    """

    __tablename__ = "task_logs"

    id = Column(Integer, primary_key=True)
    task_name = Column(String(100), nullable=False, unique=False)
    timestamp = Column(DateTime, nullable=False)
    details = Column(JSON)
