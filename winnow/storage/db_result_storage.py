import itertools
import logging
from functools import wraps
from time import time

from sqlalchemy import tuple_
from sqlalchemy.orm import joinedload, aliased

from db.schema import Files, Signature, Scene, VideoMetadata, Matches, Exif, TemplateMatches

logger = logging.getLogger(__name__)


def chunks(iterable, size=100):
    """Split iterable into equal-sized chunks."""
    iterator = iter(iterable)
    chunk = list(itertools.islice(iterator, size))
    while chunk:
        yield chunk
        chunk = list(itertools.islice(iterator, size))


def benchmark(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        start = time()
        result = func(*args, **kwargs)
        end = time()
        logger.debug(f"{func.__name__}(...) took {end - start:5.3} seconds")
        return result

    return wrapped


class DBResultStorage:
    """Database processing results storage.

    Establishes mapping between database entity classes (SQLAlchemy) and
    data types used in video processing logic (numpy, pandas, etc.).
    """

    def __init__(self, database):
        """Create a new storage instance.

        Args:
            database {db.Database}: A database instance to store and fetch
            results.
        """
        self.database = database

    @benchmark
    def add_file_signature(self, path, sha256, sig_value):
        """Add video file signature."""
        with self.database.session_scope() as session:
            query = session.query(Files).options(joinedload(Files.signature))
            file = query.filter(Files.file_path == path, Files.sha256 == sha256).one_or_none()
            file = file or Files(file_path=path, sha256=sha256)
            sig_entity = file.signature or Signature(file_id=file.id)
            sig_entity.signature = sig_value
            file.signature = sig_entity
            session.add(file)

    @benchmark
    def add_signatures(self, entries):
        """Bulk add signatures.

        Args:
            entries: Iterable of (path, sha256, signature) tuples.
        """
        # Split the work into chunks
        for chunk in chunks(entries, size=1000):
            with self.database.session_scope() as session:
                index = {(path, sha256): sig for path, sha256, sig in chunk}
                query = session.query(Files).options(joinedload(Files.signature))

                files = query.filter(self._by_path_and_hash(list(index.keys()))).all()

                # Update existing files
                for file in files:
                    sig_value = index.pop((file.file_path, file.sha256))
                    sig_entity = file.signature or Signature(file_id=file.id)
                    sig_entity.signature = sig_value
                    file.signature = sig_entity

                # Create missing files
                new_files = []
                for (path, sha256), sig_value in index.items():
                    new_files.append(Files(file_path=path, sha256=sha256, signature=Signature(signature=sig_value)))

                session.add_all(new_files)

    @benchmark
    def add_file_scenes(self, path, sha256, durations, override=False):
        """Add scenes for a single video file."""
        with self.database.session_scope() as session:
            query = session.query(Files).options(joinedload(Files.scenes))
            file = query.filter(Files.file_path == path, Files.sha256 == sha256).one_or_none()

            file = file or Files(file_path=path, sha256=sha256)

            # Delete existing scenes if needed
            if override:
                self._delete_file_scenes(session, file)

            # Skip write operation if scenes already exist
            if len(file.scenes) > 0:
                return

            # Write new scenes
            file.scenes = self._create_scenes(file, durations)
            session.add_all(file.scenes)

    @benchmark
    def add_template_matches(self, entries, override=False):

        for chunk in chunks(entries, len(entries)):

            with self.database.session_scope() as session:

                index = {}
                for path, sha256, template_match in chunk:

                    if (path, sha256) in index:

                        index[(path, sha256)].append(template_match)

                    else:
                        index[(path, sha256)] = [template_match]

                query = session.query(Files).options(joinedload(Files.template_matches))
                files = query.filter(self._by_path_and_hash(list(index.keys()))).all()

                print("Number of files found", len(files))
                # Delete existing template_matches
                if override:
                    self._delete_file_template_matches(session, *files)

                # Update existing files
                for file in files:
                    tm = index.pop((file.file_path, file.sha256))
                    new_tm = self._create_template_matches(file, tm, file.template_matches)
                    if len(new_tm) > 0:

                        file.template_matches = file.template_matches + new_tm

    @benchmark
    def add_scenes(self, entries, override=False):
        """Bulk add scenes.

        Args:
            entries: Iterable of (path, sha256, durations) tuples. Where
                durations is an iterable of scene durations in seconds.
            override: Delete existing scenes if any.
        """
        # Split the work into chunks
        for chunk in chunks(entries, size=1000):
            with self.database.session_scope() as session:
                index = {(path, sha256): durations for path, sha256, durations in chunk}
                query = session.query(Files).options(joinedload(Files.scenes))
                files = query.filter(self._by_path_and_hash(list(index.keys()))).all()

                # Delete existing scenes if needed
                if override:
                    self._delete_file_scenes(session, *files)

                # Update existing files
                for file in files:
                    durations = index.pop((file.file_path, file.sha256))

                    # Skip write operation if scenes already exist
                    if len(file.scenes) > 0:
                        continue

                    # Otherwise write scenes
                    file.scenes = self._create_scenes(file, durations)

                # Create missing files
                new_files = []
                for (path, sha256), durations in index.items():
                    new_file = Files(file_path=path, sha256=sha256)
                    new_file.scenes = self._create_scenes(new_file, durations)
                    new_files.append(new_file)
                session.add_all(new_files)

    @benchmark
    def add_file_metadata(self, path, sha256, metadata):
        """Add a single file metadata.

        Args:
            path (String): Source video file path.
            sha256 (String): Source video file hash.
            metadata: Dictionary object containing metadata attributes.
        """
        with self.database.session_scope() as session:
            query = session.query(Files).options(joinedload(Files.meta))
            file = query.filter(Files.file_path == path, Files.sha256 == sha256).one_or_none()

            file = file or Files(file_path=path, sha256=sha256)

            metadata_entity = file.meta or VideoMetadata(file=file)
            self._update_metadata(metadata_entity, metadata)
            file.meta = metadata_entity
            session.add(metadata_entity)

    @benchmark
    def add_metadata(self, entries):
        """Add metadata to multiple files.

        Args:
            entries: Iterable of (path, sha256, metadata) tuples. Where
                metadata is any dictionary-like with metadata attributes.
        """
        # Split the work into chunks
        for chunk in chunks(entries, size=1000):
            with self.database.session_scope() as session:
                index = {(path, sha256): metadata for path, sha256, metadata in chunk}
                query = session.query(Files).options(joinedload(Files.meta))
                files = query.filter(self._by_path_and_hash(list(index.keys()))).all()

                # Update existing files
                for file in files:
                    metadata = index.pop((file.file_path, file.sha256))
                    metadata_entity = file.meta or VideoMetadata(file=file)
                    self._update_metadata(metadata_entity, metadata)
                    file.meta = metadata_entity

                # Create missing files
                new_files = []
                for (path, sha256), metadata in index.items():
                    new_file = Files(file_path=path, sha256=sha256)
                    metadata_entity = VideoMetadata(file=new_file)
                    self._update_metadata(metadata_entity, metadata)
                    new_file.meta = metadata_entity
                    new_files.append(new_file)
                session.add_all(new_files)

    @benchmark
    def add_matches(self, entries):
        """Add file matches.

        Args:
            entries: Iterable of (path_1,sha256_1,path_2,sha256_2,distance)
            tuples.
        """
        # Split the work into chunks
        for chunk in chunks(entries, size=1000):
            with self.database.session_scope() as session:
                index = self._index_matches(chunk)
                matches = self._matches_by_path_and_hash(session, list(index.keys())).all()

                # Update existing matches
                for match in matches:
                    source = match.query_video_file
                    target = match.match_video_file
                    distance = index.pop((source.file_path, source.sha256, target.file_path, target.sha256))
                    match.distance = distance

                # Collect files for missing matches
                files = self._files_for_matches(session, list(index.keys()))
                file_index = {(file.file_path, file.sha256): file for file in files}

                # Create missing matches:
                new_matches = []

                for (path_1, sha256_1, path_2, sha256_2), distance in index.items():
                    query_file = file_index[(path_1, sha256_1)]
                    match_file = file_index[(path_2, sha256_2)]
                    new_match = Matches(query_video_file=query_file, match_video_file=match_file, distance=distance)
                    new_matches.append(new_match)
                session.add_all(new_matches)

    @benchmark
    def add_file_exif(self, path, sha256, exif):
        """Add a single file EXIF attributes.

        Args:
            path (String): Source video file path.
            sha256 (String): Source video file hash.
            exif: Dictionary object containing EXIF attributes.
        """
        with self.database.session_scope() as session:
            query = session.query(Files).options(joinedload(Files.exif))
            file = query.filter(Files.file_path == path, Files.sha256 == sha256).one_or_none()
            file = file or Files(file_path=path, sha256=sha256)

            exif_entity = file.exif or Exif(file=file)
            self._update_exif(exif_entity, exif)
            file.exif = exif_entity
            session.add(exif_entity)

    @benchmark
    def add_exifs(self, entries):
        """Add metadata to multiple files.

        Args:
            entries: Iterable of (path, sha256, exif) tuples. Where
               exif is any dictionary-like object with exif attributes.
        """
        # Split the work into chunks
        for chunk in chunks(entries, size=1000):
            with self.database.session_scope() as session:
                index = {(path, sha256): exif for path, sha256, exif in chunk}
                query = session.query(Files).options(joinedload(Files.exif))
                files = query.filter(self._by_path_and_hash(list(index.keys()))).all()

                # Update existing files
                for file in files:
                    exif = index.pop((file.file_path, file.sha256))
                    exif_entity = file.exif or Exif(file=file)
                    self._update_exif(exif_entity, exif)
                    file.exif = exif_entity

                # Create missing files
                new_files = []
                for (path, sha256), exif in index.items():
                    new_file = Files(file_path=path, sha256=sha256)
                    exif_entity = Exif(file=new_file)
                    self._update_exif(exif_entity, exif)
                    new_file.exif = exif_entity
                    new_files.append(new_file)
                session.add_all(new_files)

    @staticmethod
    def _by_path_and_hash(file_identifiers):
        """Get file bulk filter by path and hash pairs."""
        return tuple_(Files.file_path, Files.sha256).in_(file_identifiers)

    @staticmethod
    def _scene_ids(*files):
        """Get all scene ids associated with the given files."""
        scenes = itertools.chain(*(file.scenes or () for file in files))
        return [scene.id for scene in scenes]

    @staticmethod
    def _template_matches_ids(session, *files):
        """Get all template_matches ids associated with the given files."""
        template_matches = itertools.chain(*(file.template_matches or () for file in files))
        return [template_match.id for template_match in template_matches]

    @staticmethod
    def _delete_file_scenes(session, *files):
        """Delete all scenes associated with the given files."""
        existing_scene_ids = DBResultStorage._scene_ids(*files)
        session.query(Scene).filter(Scene.id.in_(existing_scene_ids)).delete(synchronize_session="fetch")
        for file in files:
            file.scenes = []

    @staticmethod
    def _delete_file_template_matches(session, *files):
        """Delete all scenes associated with the given files."""
        existing_template_matches_ids = DBResultStorage._template_matches_ids(*files)

        (
            session.query(TemplateMatches)
            .filter(TemplateMatches.id.in_(existing_template_matches_ids))
            .delete(synchronize_session="fetch")
        )

        for file in files:
            file.template_matches = []

    @staticmethod
    def _filter_unique_templates(old_templates, new_templates):

        filtered = []
        seen = dict({f"{element.file_id}{element.template_name}": True for element in old_templates})

        for element in new_templates:
            hsh = f'{element["file_id"]}{element["template_name"]}'
            if hsh not in seen:
                filtered.append(element)
                seen[hsh] = True

        return filtered

    @staticmethod
    def _create_template_matches(file, tp_match, old_templates):

        """Create Template Matches entities for the given file
        from the durations.
        """
        seen = dict({f"{element.file_id}{element.template_name}": True for element in old_templates})
        tm = []
        for match in tp_match:

            hsh = f'{file.id}{match["template_name"]}'

            if hsh not in seen:

                tm.append(
                    TemplateMatches(
                        file=file,
                        file_id=file.id,
                        distance=match["distance"],
                        template_name=match["template_name"],
                        closest_match=match["closest_match"],
                        closest_match_time=match["closest_match_time"],
                    )
                )

        return tm

    @staticmethod
    def _create_scenes(file, durations):
        """Create scene entities for the given file from the durations."""
        scenes = []
        start_time = 0
        for duration in durations:
            scenes.append(Scene(file=file, start_time=int(start_time), duration=int(duration)))
            start_time += duration
        return scenes

    @staticmethod
    def _update_metadata(metadata_entity, metadata):
        """Update metadata attributes"""
        metadata_entity.gray_max = metadata.get("gray_max", metadata_entity.gray_max)

        metadata_entity.video_dark_flag = metadata.get("video_dark_flag", metadata_entity.video_dark_flag)

        metadata_entity.flagged = metadata.get("flagged", metadata_entity.flagged)

    @staticmethod
    def _index_matches(chunk):
        """Index matches from entries chunk."""
        index = {}
        for path_1, sha256_1, path_2, sha256_2, distance in chunk:
            index[(path_1, sha256_1, path_2, sha256_2)] = distance
        return index

    @staticmethod
    def _matches_by_path_and_hash(session, file_identifiers):
        """Get matches bulk query by files paths and hashes."""
        query_file = aliased(Files)
        match_file = aliased(Files)

        tuple_filter = tuple_(query_file.file_path, query_file.sha256, match_file.file_path, match_file.sha256).in_(
            file_identifiers
        )

        return (
            session.query(Matches)
            .join(query_file, Matches.query_video_file)
            .join(match_file, Matches.match_video_file)
            .filter(tuple_filter)
        )

    @staticmethod
    def _matches_file_identifiers(connections):
        """Get file identifiers from connections of the form
        (path_1,sha256_1,path_2,sha256_2)."""
        result = []
        for path_1, sha256_1, path_2, sha256_2 in connections:
            result.append((path_1, sha256_1))
            result.append((path_2, sha256_2))
        return result

    @staticmethod
    def _files_for_matches(session, connections):
        """
        Get or create files for connections of the form
        (path_1,sha256_1,path_2,sha256_2).
        """
        file_identifiers = set(DBResultStorage._matches_file_identifiers(connections))
        existing_files = session.query(Files).filter(DBResultStorage._by_path_and_hash(file_identifiers)).all()

        # Get missing files (path,hash) ids
        for file in existing_files:
            file_identifiers.remove((file.file_path, file.sha256))

        # Create missing files
        new_files = []
        for path, sha256 in file_identifiers:
            new_file = Files(file_path=path, sha256=sha256)
            new_files.append(new_file)
        session.add_all(new_files)

        return existing_files + new_files

    @staticmethod
    def _update_exif(entity, exif):
        entity.General_FileExtension = exif.get("General_FileExtension", entity.General_FileExtension)
        entity.General_Format_Commercial = exif.get("General_Format_Commercial", entity.General_Format_Commercial)
        entity.General_FileSize = exif.get("General_FileSize", entity.General_FileSize)
        entity.General_Duration = exif.get("General_Duration", entity.General_Duration)
        entity.General_OverallBitRate_Mode = exif.get("General_OverallBitRate_Mode", entity.General_OverallBitRate_Mode)
        entity.General_OverallBitRate = exif.get("General_OverallBitRate", entity.General_OverallBitRate)
        entity.General_FrameRate = exif.get("General_FrameRate", entity.General_FrameRate)
        entity.General_FrameCount = exif.get("General_FrameCount", entity.General_FrameCount)
        entity.General_Encoded_Date = exif.get("General_Encoded_Date", entity.General_Encoded_Date)
        entity.General_File_Modified_Date = exif.get("General_File_Modified_Date", entity.General_File_Modified_Date)
        entity.General_File_Modified_Date_Local = exif.get(
            "General_File_Modified_Date_Local", entity.General_File_Modified_Date_Local
        )
        entity.General_Tagged_Date = exif.get("General_Tagged_Date", entity.General_Tagged_Date)
        entity.Video_Format = exif.get("Video_Format", entity.Video_Format)
        entity.Video_BitRate = exif.get("Video_BitRate", entity.Video_BitRate)
        entity.Video_InternetMediaType = exif.get("Video_InternetMediaType", entity.Video_InternetMediaType)
        entity.Video_Width = exif.get("Video_Width", entity.Video_Width)
        entity.Video_Height = exif.get("Video_Height", entity.Video_Height)
        entity.Video_FrameRate = exif.get("Video_FrameRate", entity.Video_FrameRate)
        entity.Audio_Format = exif.get("Audio_Format", entity.Audio_Format)
        entity.Audio_SamplingRate = exif.get("Audio_SamplingRate", entity.Audio_SamplingRate)
        entity.Audio_Title = exif.get("Audio_Title", entity.Audio_Title)
        entity.Audio_BitRate = exif.get("Audio_BitRate", entity.Audio_BitRate)
        entity.Audio_Channels = exif.get("Audio_Channels", entity.Audio_Channels)
        entity.Audio_Duration = exif.get("Audio_Duration", entity.Audio_Duration)
        entity.Audio_Encoded_Date = exif.get("Audio_Encoded_Date", entity.Audio_Encoded_Date)
        entity.Audio_Tagged_Date = exif.get("Audio_Tagged_Date", entity.Audio_Tagged_Date)
