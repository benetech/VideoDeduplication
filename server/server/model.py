import base64
import math
from datetime import datetime
from functools import wraps
from typing import Dict, Optional

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect

from db.access.files import FileData
from db.schema import (
    Contributor,
    Repository,
    Files,
    VideoMetadata,
    Scene,
    Exif,
    Matches,
    Template,
    TemplateExample,
    TemplateMatches,
    FileFilterPreset,
    TemplateFileExclusion,
)

database = SQLAlchemy()

# Custom value serializers
_SERIALIZE = {
    bytes: lambda value: base64.b64encode(value).decode("UTF-8"),
    datetime: datetime.timestamp,
    float: lambda value: value if math.isfinite(value) else None,
}


def prepare_serialization(data):
    """Perform a shallow serialization of field values if needed."""
    if data is None:
        return data
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
    def file_data(
        file_data: FileData,
        *,
        meta=False,
        signature=False,
        scenes=False,
        exif=False,
        contributor=True,
        related=False,
        duplicates=False,
        templates=False,
    ) -> Dict:
        """Get plain data representation for a single extended file data item."""
        result = Transform.file(
            file_data.file,
            meta=meta,
            signature=signature,
            scenes=scenes,
            exif=exif,
            contributor=contributor,
        )
        if related is not None:
            result["related_count"] = file_data.related_count
        if duplicates is not None:
            result["duplicates_count"] = file_data.duplicate_count
        if templates is not None:
            result["matched_templates"] = file_data.matched_templates
        return result

    @staticmethod
    @serializable
    def file(file: Files, *, meta=False, signature=False, scenes=False, exif=False, contributor=True) -> Dict:
        """Get plain data representation for single file."""
        data = {
            "id": file.id,
            "file_path": file.file_path,
            "sha256": file.sha256,
            "created_date": file.created_date,
            "external": file.contributor_id is not None,
        }
        if meta:
            data["meta"] = Transform.metadata(file.meta)
        if signature and file.signature is not None:
            data["signature"] = file.signature.signature
        if scenes:
            data["scenes"] = [Transform.scene(scene, file=False) for scene in file.scenes]
        if exif:
            data["exif"] = Transform.exif(file.exif)
        if contributor:
            data["contributor"] = Transform.contributor(file.contributor)
        return data

    @staticmethod
    @serializable
    def metadata(meta: Optional[VideoMetadata]) -> Dict:
        """Get plain data representation for VideoMetadata."""
        if meta is None:
            return None
        fields = entity_fields(meta)
        fields -= {"id", "file_id", "file"}
        return {field: getattr(meta, field) for field in fields}

    @staticmethod
    @serializable
    def scene(scene: Scene, file=False) -> Dict:
        """Get plain data representation for single Scene."""
        data = {
            "id": scene.id,
            "duration": scene.duration,
            "start_time": scene.start_time,
        }
        if file:
            data["file"] = Transform.file(scene.file, scenes=False)
        return data

    @staticmethod
    @serializable
    def exif(exif: Exif) -> Dict:
        """Get plain data representation for Exif."""
        if exif is None:
            return None
        fields = entity_fields(exif)
        fields -= {"id", "file_id", "file"}
        return {field: getattr(exif, field) for field in fields}

    @staticmethod
    @serializable
    def file_match(match: Matches, file_id, *, meta=False, signature=False, scenes=False, exif=False) -> Dict:
        """Get plain data representation for single file match."""
        if match.query_video_file.id != file_id:
            matched = match.query_video_file
        else:
            matched = match.match_video_file
        return {
            "id": match.id,
            "distance": match.distance,
            "mother_file_id": file_id,
            "file": Transform.file(matched, meta=meta, signature=signature, scenes=scenes, exif=exif),
            "false_positive": match.false_positive,
        }

    @staticmethod
    @serializable
    def match(match: Matches) -> Dict:
        """Get plain data representation for Match."""
        return {
            "id": match.id,
            "distance": match.distance,
            "source": match.query_video_file_id,
            "target": match.match_video_file_id,
            "false_positive": match.false_positive,
        }

    @staticmethod
    @serializable
    def contributor(contributor: Optional[Contributor], *, repository=True) -> Dict:
        """Get plain data representation for contributor."""
        if contributor is None:
            return None
        data = {
            "id": contributor.id,
            "name": contributor.name,
        }
        if repository:
            data["repository"] = Transform.repository(contributor.repository)
        return data

    @staticmethod
    @serializable
    def repository(repository: Optional[Repository]) -> Dict:
        """Get plain data representation for repository."""
        if repository is None:
            return None
        return {
            "id": repository.id,
            "name": repository.name,
            "address": repository.network_address,
            "login": repository.account_id,
            "type": repository.repository_type.value,
        }

    @staticmethod
    @serializable
    def template(template: Template, *, file_count: int = None, examples=False) -> Dict:
        """Get dict-data for template."""
        data = {
            "id": template.id,
            "name": template.name,
            "icon_type": template.icon_type.value if template.icon_type else None,
            "icon_key": template.icon_key,
        }
        if examples:
            data["examples"] = [Transform.template_example(example, template=False) for example in template.examples]
        if file_count is not None:
            data["file_count"] = file_count
        return data

    @staticmethod
    @serializable
    def template_example(example: TemplateExample, *, template=False) -> Dict:
        """Get dict-data representation of the template example."""
        data = {
            "id": example.id,
            "template_id": example.template_id,
        }
        if template:
            data["template"] = Transform.template(example.template, examples=False)
        return data

    @staticmethod
    @serializable
    def template_match(match: TemplateMatches, *, template=False, file=Files) -> Dict:
        """Get dict-data representation of the template match."""
        data = {
            "id": match.id,
            "file_id": match.file_id,
            "template_id": match.template_id,
            "start_ms": match.start_ms,
            "end_ms": match.end_ms,
            "mean_distance_sequence": match.mean_distance_sequence,
            "min_distance_video": match.min_distance_video,
            "min_distance_ms": match.min_distance_ms,
            "false_positive": match.false_positive,
        }
        if template:
            data["template"] = Transform.template(match.template, examples=False)
        if file:
            data["file"] = Transform.file(match.file, meta=True, exif=True)
        return data

    @staticmethod
    @serializable
    def file_filter_preset(preset: FileFilterPreset) -> Dict:
        """Get dict-data representation of the file filer preset."""
        return {
            "id": preset.id,
            "name": preset.name,
            "filters": preset.filters,
        }

    @staticmethod
    @serializable
    def template_file_exclusion(exclusion: TemplateFileExclusion) -> Dict:
        """Get dict-data representation of the template-file exclusion."""
        return {
            "id": exclusion.id,
            "file": Transform.file(exclusion.file),
            "template": Transform.template(exclusion.template),
        }
