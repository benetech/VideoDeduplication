import base64
import math
from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

from db.schema import Base

database = SQLAlchemy()


def finite(value):
    """Check if value is NaN or +-Infinity"""
    return not isinstance(value, float) or math.isfinite(value)


def filter_values(entries):
    """Remove unwanted values from dictionary"""
    for key, value in entries:
        if value is not None and finite(value):
            yield key, value


# Custom value serializers
_SERIALIZE = {
    bytes: lambda value: base64.b64encode(value).decode('UTF-8'),
    datetime: datetime.timestamp
}


class Transform:
    @staticmethod
    def dict(entity, **include):
        """Get JSON-serializable dict for the database entity"""
        return dict(Transform._dict_attrs(entity, {entity}, **include))

    @staticmethod
    def _dict_attrs(entity, _seen, **include):
        """Iterate over serializable entity attributes"""
        for key, value in filter_values(entity.fields(**include)):
            if isinstance(value, Base) and value in _seen:
                continue
            yield key, Transform._value(value, _seen)

    @staticmethod
    def _value(value, _seen):
        """Transform value if required"""
        if isinstance(value, Base):
            _seen.add(value)
            return dict(Transform._dict_attrs(value, _seen))
        elif isinstance(value, list):
            return [Transform._value(item, _seen) for item in value]
        elif type(value) in _SERIALIZE:
            serialize = _SERIALIZE[type(value)]
            return serialize(value)
        return value
