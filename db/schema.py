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

    signature = relationship("Signature", uselist=False, back_populates="file")
    meta = relationship("VideoMetadata", uselist=False, back_populates="file")
    scenes = relationship("Scene", back_populates="file")
    template_matches = relationship("TemplateMatches", back_populates="file", cascade="all, delete-orphan")
    exif = relationship("Exif", uselist=False, back_populates="file")

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


class TemplateMatches(Base):
    __tablename__ = "templatematches"
    # __table_args__ = (UniqueConstraint('file_id', 'template_name'),)
    id = Column(Integer, autoincrement=True, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    file = relationship("Files", back_populates="template_matches")
    template_name = Column(String)
    distance = Column(Float)
    closest_match = Column(Float)
    closest_match_time = Column(String)


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
    name = Column(String, nullable=False)
    # Repository type determines how to access the repository
    repository_type = Column(Enum(RepositoryType), nullable=False, default=RepositoryType.BARE_DATABASE)
    # Address format may depend on repository type
    network_address = Column(String, nullable=False)
    # Account id or username which we use to access the repository
    account_id = Column(String, nullable=False)
    # Credentials ID in a secured credentials store
    credentials_id = Column(String, nullable=False)

    # Relationships

    contributors = relationship("Contributor", back_populates="repository")


class Contributor(Base):
    """An organization that contributed some fingerprints to the remote repository."""

    __tablename__ = "contributors"

    id = Column(Integer, primary_key=True)
    # Any identifier used in the corresponding repository to designate this contributor
    name = Column(String, nullable=False)
    # A repository from which this contributor is known
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)

    # Relationships

    repository = relationship("Repository", back_populates="contributors")
    files = relationship("Files", back_populates="contributor")
