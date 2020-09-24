import os

import pytest

from winnow.config import Config, DatabaseConfig, RepresentationConfig, ProcessingConfig, TemplatesConfig, SourcesConfig


@pytest.fixture
def config_path():
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "test-config.yaml")


@pytest.fixture
def config(config_path):
    return Config.read(config_path)


def test_smoke(config):
    assert isinstance(config, Config)
    assert isinstance(config.database, DatabaseConfig)
    assert isinstance(config.sources, SourcesConfig)
    assert isinstance(config.processing, ProcessingConfig)
    assert isinstance(config.templates, TemplatesConfig)
    assert isinstance(config.repr, RepresentationConfig)


def test_parsing(config):
    assert config.processing.filter_dark_videos is True


def test_fromdict():
    config = Config.fromdict({"processing": {"filter_dark_videos_thr": 42}})
    assert config.processing.filter_dark_videos_thr == 42, "Values from dict should be used when possible"
    assert config.database.use is True, "Default value should be used for missing items"
