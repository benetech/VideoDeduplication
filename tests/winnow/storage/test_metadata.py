import tempfile

from dataclasses import dataclass

from winnow.storage.metadata import DataLoader, FeaturesMetadata


@dataclass
class Child:
    """Nested test class."""

    value: str


@dataclass
class Parent:
    """Parent test class."""

    value: int
    child: Child


def test_asdict():
    loader = DataLoader(FeaturesMetadata)
    metadata = FeaturesMetadata(frame_sampling=42)
    assert loader.asdict(metadata) == {"frame_sampling": 42}


def test_asdict_nested():
    loader = DataLoader(Parent)
    data_object = Parent(value=42, child=Child(value="something"))
    assert loader.asdict(data_object) == {"value": 42, "child": {"value": "something"}}


def test_fromdict():
    loader = DataLoader(FeaturesMetadata)
    data = {"frame_sampling": 42}
    expected_object = FeaturesMetadata(frame_sampling=42)
    assert loader.fromdict(data) == expected_object


def test_fromdict_nested():
    loader = DataLoader(Parent)
    data = {"value": 42, "child": {"value": "something"}}
    expected_object = Parent(value=42, child=Child(value="something"))
    assert loader.fromdict(data) == expected_object


def test_dumps():
    loader = DataLoader(Parent)
    data_object = Parent(value=42, child=Child(value="something"))
    assert loader.dumps(data_object, indent=None) == '{"child": {"value": "something"}, "value": 42}'


def test_dumps_loads():
    loader = DataLoader(FeaturesMetadata)
    data_object = FeaturesMetadata(frame_sampling=42)
    assert loader.loads(loader.dumps(data_object)) == data_object


def test_dumps_loads_nested():
    loader = DataLoader(Parent)
    data_object = Parent(value=42, child=Child(value="something"))
    assert loader.loads(loader.dumps(data_object)) == data_object


def test_dump_load():
    with tempfile.TemporaryFile(mode="w+") as file:
        loader = DataLoader(FeaturesMetadata)
        data_object = FeaturesMetadata(frame_sampling=42)
        loader.dump(data_object, file)
        file.seek(0)
        assert loader.load(file) == data_object


def test_dump_load_nested():
    with tempfile.TemporaryFile(mode="w+") as file:
        loader = DataLoader(Parent)
        data_object = Parent(value=42, child=Child(value="something"))
        loader.dump(data_object, file)
        file.seek(0)
        assert loader.load(file) == data_object
