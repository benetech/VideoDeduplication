from sqlalchemy import or_

from db.schema import Matches
from ..model import database


def file_matches(file_id):
    """Query for all file matches."""
    return database.session.query(Matches).filter(or_(
        Matches.query_video_file_id == file_id,
        Matches.match_video_file_id == file_id
    ))
