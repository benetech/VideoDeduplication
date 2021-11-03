from functools import cached_property

from sqlalchemy.orm import joinedload


# A simple framework for field preloading.


class Fields:
    """Helper class to fetch entity fields."""

    def __init__(self, *fields):
        self._fields = tuple(fields)
        self._index = {field.key: field for field in fields}

    @property
    def fields(self):
        """List fields."""
        return self._fields

    @cached_property
    def names(self):
        """Set of field names."""
        return {field.key for field in self.fields}

    def get(self, name):
        """Get field by name."""
        return self._index[name]

    @staticmethod
    def preload(query, fields, *path):
        """Enable eager loading for enumerated fields."""
        for field in fields:
            full_path = path + (field,)
            query = query.options(joinedload(*full_path))
        return query
