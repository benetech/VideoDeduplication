"""The repr module offers high-level utility functions to work with intermediate representations."""
import hashlib
import json

from winnow.storage.repr_key import ReprKey
from winnow.storage.repr_utils import path_resolver
from winnow.utils.files import get_hash


def reprkey_resolver(config):
    """Create a function to get intermediate storage key and tags by the file path.

    Args:
        config (winnow.config.Config): Pipeline configuration.
    """

    storepath = path_resolver(config.sources.root)
    config_tag = get_config_tag(config)

    def reprkey(path):
        """Get intermediate representation storage key."""
        return ReprKey(path=storepath(path), hash=get_hash(path), tag=config_tag)

    return reprkey


def get_config_tag(config):
    """Get configuration tag.

    Whenever configuration changes making the intermediate representation
    incompatible the tag value will change as well.
    """

    # Configuration attributes that affect representation value
    config_attributes = dict(frame_sampling=config.proc.frame_sampling)

    sha256 = hashlib.sha256()
    sha256.update(json.dumps(config_attributes).encode("utf-8"))
    return sha256.hexdigest()[:40]
