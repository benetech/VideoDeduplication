import base64
import math
from datetime import datetime
from functools import wraps

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect

database = SQLAlchemy()

# Custom value serializers
_SERIALIZE = {
    bytes: lambda value: base64.b64encode(value).decode('UTF-8'),
    datetime: datetime.timestamp,
    float: lambda value: value if math.isfinite(value) else None
}


def prepare_serialization(data):
    """Perform a shallow serialization of field values if needed."""
    for key, value in data.items():
        if type(value) in _SERIALIZE:
            serialize = _SERIALIZE[type(value)]
            data[key] = serialize(value)
    return data


def serializable(func):
    """Make sure function returns serializable data structure."""

    @wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return prepare_serialization(result)

    return wrapper


def entity_fields(entity):
    """Get entity field names."""
    mapper = inspect(entity).mapper
    return set(attribute.key for attribute in mapper.attrs)


class Transform:
    """Convert database entities to serializable data structures."""

    @staticmethod
    @serializable
    def file_dict(file, *, meta=False, signature=False, scenes=False, exif=False):
        """Get plain data representation for single file."""
        data = {
            "id": file.id,
            "file_path": file.file_path,
            "sha256": file.sha256,
            "created_date": file.created_date,
        }
        if meta:
            data["meta"] = Transform.metadata_dict(file.meta)
        if signature:
            data["signature"] = file.signature.signature
        if scenes:
            data["scenes"] = [Transform.scene_dict(scene, file=False) for scene in file.scenes]
        if exif:
            data["exif"] = Transform.exif_dict(file.exif)
        return data

    @staticmethod
    @serializable
    def metadata_dict(meta):
        """Get plain data representation for VideoMetadata."""
        fields = entity_fields(meta)
        fields -= {"id", "file_id", "file"}
        return {field: getattr(meta, field) for field in fields}

    @staticmethod
    @serializable
    def scene_dict(scene, file=False):
        """Get plain data representation for single Scene."""
        data = {
            "id": scene.id,
            "duration": scene.duration,
            "start_time": scene.start_time,
        }
        if file:
            data["file"] = Transform.file_dict(scene.file, scenes=False)
        return data

    @staticmethod
    @serializable
    def exif_dict(exif):
        """Get plain data representation for Exif."""
        fields = entity_fields(exif)
        fields -= {"id", "file_id", "file", "Json_full_exif"}
        return {field: getattr(exif, field) for field in fields}

    @staticmethod
    @serializable
    def file_match_dict(match, file_id, *, meta=False, signature=False, scenes=False, exif=False):
        """Get plain data representation for single file match."""
        if match.query_video_file.id != file_id:
            matched = match.query_video_file
        else:
            matched = match.match_video_file
        return {
            "distance": match.distance,
            "file": Transform.file_dict(matched, meta=meta, signature=signature, scenes=scenes, exif=exif)
        }

    @staticmethod
    @serializable
    def match_dict(match):
        """Get plain data representation for Match."""
        return {
            "distance": match.distance,
            "source": match.query_video_file_id,
            "target": match.match_video_file_id
        }
