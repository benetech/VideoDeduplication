import json
from typing import Dict, Union, TextIO, BinaryIO

import dacite
from dataclasses import asdict, dataclass


class DataLoader:
    """Dataclass serializer-deserializer.

    The purpose of this class is to read and store metadata represented by a dataclass object.
    """

    def __init__(self, data_class):
        self._data_class = data_class

    def load(self, reader: Union[TextIO, BinaryIO], **kwargs):
        """Load dataclass object from the File-Like object."""
        data = json.load(reader, **kwargs)
        return self.fromdict(data)

    def loads(self, text: str, **kwargs):
        """Load dataclass object from the string."""
        data = json.loads(text, **kwargs)
        return self.fromdict(data)

    def dump(self, data_object, writer: Union[TextIO, BinaryIO], **kwargs):
        """Dump dataclass object to the File-Like writer."""
        data = self.asdict(data_object)
        kwargs.setdefault("indent", 4)
        kwargs.setdefault("sort_keys", True)
        return json.dump(data, writer, **kwargs)

    def dumps(self, data_object, **kwargs) -> str:
        """Dump dataclass object to the string."""
        data = self.asdict(data_object)
        kwargs.setdefault("indent", 4)
        kwargs.setdefault("sort_keys", True)
        return json.dumps(data, **kwargs)

    @staticmethod
    def asdict(data_object) -> Dict:
        """Convert dataclass object to dict."""
        return asdict(data_object)

    def fromdict(self, data: Dict):
        """Restore dataclass object from dict."""
        return dacite.from_dict(data_class=self.data_class, data=data)

    @property
    def data_class(self):
        """Data class to be serialized and deserialized."""
        return self._data_class


@dataclass
class FeaturesMetadata:
    """
    Configuration options used to extract features from video-file.
    """

    frame_sampling: int
