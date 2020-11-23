import datetime

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
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, object_session

Base = declarative_base()


class Files(Base):
    __tablename__ = "files"
    __table_args__ = (UniqueConstraint("file_path", "sha256", name="_file_uc"),)

    id = Column(Integer, primary_key=True)
    created_date = Column(DateTime, default=datetime.datetime.utcnow)
    sha256 = Column(String)
    file_path = Column(String)
    signature = relationship("Signature", uselist=False, back_populates="file")
    meta = relationship("VideoMetadata", uselist=False, back_populates="file")
    scenes = relationship("Scene", back_populates="file")
    templatematches = relationship("Templatematches", back_populates="file", cascade="all, delete-orphan")
    exif = relationship("Exif", uselist=False, back_populates="file")

    # TODO: find a way to merge these two relationships
    #   (See https://github.com/benetech/VideoDeduplication/issues/141)
    source_matches = relationship(
        "Matches", back_populates="query_video_file", foreign_keys="Matches.query_video_file_id"
    )
    target_matches = relationship(
        "Matches", back_populates="match_video_file", foreign_keys="Matches.match_video_file_id"
    )


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


class Templatematches(Base):
    __tablename__ = "templatematches"
    # __table_args__ = (UniqueConstraint('file_id', 'template_name'),)
    id = Column(Integer, autoincrement=True, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    file = relationship("Files", back_populates="templatematches")
    template_name = Column(String)
    distance = Column(Float)
    closest_match = Column(Float)
    closest_match_time = Column(String)


@event.listens_for(Files.templatematches, "remove")
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


# TODO: Change to date columns to datetime type (#137)
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
