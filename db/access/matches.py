import itertools
from typing import List

from dataclasses import dataclass, field
from sqlalchemy import Column, or_
from sqlalchemy.orm import joinedload, aliased, contains_eager

from db.schema import Files, Matches


def _chunks(iterable, size=100):
    """Split iterable into equal-sized chunks."""
    iterator = iter(iterable)
    chunk = list(itertools.islice(iterator, size))
    while chunk:
        yield chunk
        chunk = list(itertools.islice(iterator, size))


@dataclass
class FileMatchesRequest:
    """List single file's matches request."""

    file: Files
    limit: int = 20
    offset: int = 0
    max_distance: float = 1.0
    min_distance: float = 0.0
    hops: int = 1
    preload: List[Column] = field(default_factory=list)


@dataclass
class FileMatchesResult:
    """List single file's matches results."""

    files: List[Files]
    matches: List[Matches]
    total: int


class MatchesDAO:
    """Data-access object for file matches."""

    @staticmethod
    def list_file_matches(req: FileMatchesRequest, session) -> FileMatchesResult:
        """List single file's matches."""
        files = []
        # ids of files that was loaded during previous
        # steps or will be loaded during the current step
        seen = {req.file.id}
        # ids of files that will be loaded during the current step
        current_step = {req.file.id}
        # 'step' variable is always equal to the minimal distance (number of arrows)
        # from the source file to the files that will be loaded during the current step
        for step in range(req.hops + 1):
            # ids of files that will be loaded during the next step
            next_step = set()
            more_steps = step < req.hops

            # Perform current step in equal-sized chunks
            for chunk in _chunks(current_step):
                query = session.query(Files)
                query = MatchesDAO._join_matches(query, req)
                query = MatchesDAO._preload_file_attrs(query, req.preload)
                items = query.filter(Files.id.in_(chunk)).all()
                for file in items:
                    files.append(file)
                    if more_steps:
                        MatchesDAO._populate_next_step(file, seen, next_step)
            seen.update(next_step)
            current_step = next_step
        matches = MatchesDAO._extract_matches(files, file_ids=seen)

        # Slice result set
        matches, files, total = MatchesDAO._slice_results(req.file, matches, offset=req.offset, limit=req.limit)
        return FileMatchesResult(files=files, matches=matches, total=total)

    @staticmethod
    def _populate_next_step(file, seen, next_step):
        """Add not-seen files to the next step."""
        for match in file.source_matches:
            matched_file = match.match_video_file
            if matched_file.id not in seen:
                next_step.add(matched_file.id)
        for match in file.target_matches:
            matched_file = match.query_video_file
            if matched_file.id not in seen:
                next_step.add(matched_file.id)

    @staticmethod
    def _preload_file_attrs(query, preload):
        """Preload requested optional file attributes."""
        for relation in preload:
            query = query.options(joinedload(relation))
        return query

    @staticmethod
    def _extract_matches(files, file_ids):
        """Build matches list."""
        matches = set()
        for file in files:
            for match in file.target_matches:
                if match.match_video_file_id in file_ids and match.query_video_file_id in file_ids:
                    matches.add(match)
            for match in file.source_matches:
                if match.match_video_file_id in file_ids and match.query_video_file_id in file_ids:
                    matches.add(match)
        matches = list(matches)
        matches.sort(key=lambda item: item.id)
        return matches

    @staticmethod
    def _join_matches(query, req):
        """Apply filters by match attributes."""
        outgoing = aliased(Matches)
        incoming = aliased(Matches)
        return (
            query.outerjoin(
                outgoing,
                (outgoing.query_video_file_id == Files.id)
                & (outgoing.distance >= req.min_distance)
                & (outgoing.distance <= req.max_distance),
            )
            .outerjoin(
                incoming,
                (incoming.match_video_file_id == Files.id)
                & (incoming.distance >= req.min_distance)
                & (incoming.distance <= req.max_distance),
            )
            .options(contains_eager(Files.source_matches, alias=outgoing))
            .options(contains_eager(Files.target_matches, alias=incoming))
        )

    @staticmethod
    def _slice_results(start_file, matches, offset, limit):
        """Extract requested slice from matches."""
        # Slice matches
        total = len(matches)
        matches = sorted(matches, key=lambda item: item.id)
        matches = matches[offset : offset + limit]

        # Get the corresponding files
        files = {start_file}
        for match in matches:
            files.add(match.match_video_file)
            files.add(match.query_video_file)
        files = sorted(list(files), key=lambda item: item.id)
        return matches, files, total

    @staticmethod
    def list_matches_query(session, path=None, min_distance=None, max_distance=None, limit=1000, offset=0):
        """Query matches."""
        query = session.query(Matches)
        query = query.options(joinedload(Matches.query_video_file), joinedload(Matches.match_video_file))
        if min_distance is not None:
            query = query.filter(Matches.distance >= min_distance)
        if max_distance is not None:
            query = query.filter(Matches.distance <= max_distance)
        if path:
            query = query.filter(
                or_(
                    Matches.match_video_file.has(Files.file_path.ilike(f"%{path}%")),
                    Matches.query_video_file.has(Files.file_path.ilike(f"%{path}%")),
                )
            )
        return query.limit(limit).offset(offset)
