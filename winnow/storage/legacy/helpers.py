import hashlib
import json

from deprecation import deprecated

from winnow.config import Config


@deprecated(details="ReprKey is replaced by simpler FileKey. See issue #297")
def get_config_tag(config: Config) -> str:
    """Get configuration tag.

    Whenever configuration changes making the intermediate representation
    incompatible the tag value will change as well.
    """

    # Configuration attributes that affect representation value
    config_attributes = dict(frame_sampling=config.proc.frame_sampling)

    sha256 = hashlib.sha256()
    sha256.update(json.dumps(config_attributes).encode("utf-8"))
    return sha256.hexdigest()[:40]
