from datetime import timedelta
from pickle import loads

from db.schema import Files


def format_duration():
    pass


class Transform:
    FILE_FIELDS = (
        "path",
        "hash",
        "hash_short",
        "created",
        "length_human",
        "length_millis",
        "fingerprint",
        "fingerprint_short",
        "contributor_name",
        "repo_name",
        "repo_address",
    )

    @staticmethod
    def file(file: Files):
        if file.exif and file.exif.General_Duration is not None:
            length_millis = file.exif.General_Duration
            length_human = str(timedelta(seconds=round(length_millis / 1000)))
        else:
            length_millis = None
            length_human = None

        fingerprint = None
        if file.signature:
            fingerprint = loads(file.signature.signature).tobytes().hex()

        return {
            "path": file.file_path,
            "hash": file.sha256,
            "hash_short": file.sha256[:10] if file.sha256 else None,
            "created": str(file.created_date),
            "length_human": length_human,
            "length_millis": length_millis,
            "fingerprint": fingerprint,
            "fingerprint_short": fingerprint[:10] if fingerprint is not None else None,
            "contributor_name": file.contributor.name if file.contributor else None,
            "repo_name": file.contributor.repository.name if file.contributor else None,
            "repo_address": file.contributor.repository.network_address if file.contributor else None,
        }
