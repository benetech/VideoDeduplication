from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine,Table, Column, String, MetaData,Integer,Binary,Boolean,Float,ARRAY


Base = declarative_base()

class Signature(Base):
    
    __tablename__ = 'signatures'
    id = Column(Integer,primary_key=True)
    original_filename = Column(String)
    signature = Column(Binary)

# TODO:Revaluate which columns are actually essential
# TODO: Add sha signature

class VideoMetadata(Base):
    
    __tablename__ = 'videometadata'

    original_filename = Column(String,primary_key=True)
    video_length = Column(Float)
    avg_act = Column(Float)
    video_avg_std = Column(Float)
    video_max_dif = Column(Float)
    gray_avg = Column(Float)
    gray_std = Column(Float)
    gray_max = Column(Float)
    gray_max = Column(Float)
    video_duration_flag = Column(Boolean)
    video_dark_flag = Column(Boolean)
    flagged = Column(Boolean)
    

class Scenes(Base):

    __tablename__ = 'scenes'
    original_filename = Column(String,primary_key=True)
    video_duration = Column(Float)
    avg_duration = Column(Float)
    scene_duration = Column(ARRAY(Integer))
    