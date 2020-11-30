"""The files module offers high-level operations with file-system."""
import hashlib
import os
from glob import glob
from pathlib import Path


def read_chunks(file_object, buffer_size=64 * 1024):
    """Read chunks from file object."""
    chunk = file_object.read(buffer_size)
    while chunk:
        yield chunk
        chunk = file_object.read(buffer_size)


def get_hash(file_path, buffer_size=64 * 1024):
    """Get sha256 hash of the file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as file:
        for data in read_chunks(file, buffer_size):
            sha256.update(data)
    return sha256.hexdigest()


def filter_extensions(files, extensions):
    """Filter files by extensions."""
    extensions = {f".{ext}" for ext in extensions}
    return [x for x in files if Path(x).suffix in extensions]


def scan_videos(path, wildcard, extensions=[]):
    """Scans a directory for a given wildcard

    Args:
        path (String): Root path of the directory to be scanned
        wildcard (String): Wild card related to the files being searched
        (eg. ** for video files or **_vgg_features.npy for extracted features
        files) extensions (list, optional): Filter files by giving a list of
        supported file extensions (eg a list of video extensions).
        Defaults to [].

    Returns:
        List[String]: A list of file paths
    """
    files = glob(os.path.join(path, wildcard), recursive=True)
    files = [x for x in files if os.path.isfile(x)]
    if len(extensions) > 0:
        files = filter_extensions(files, extensions)

    return files


def _read_lines(file_path):
    """Read line from text file."""
    with open(file_path, encoding="utf-8") as file:
        return file.read().splitlines()


def scan_videos_from_txt(file_list_path, extensions=[]):
    """Get existing files from the file list .txt file."""
    files = _read_lines(file_list_path)
    files = [x for x in files if os.path.isfile(x)]
    if len(extensions) > 0:
        files = filter_extensions(files, extensions)
    return files


def create_video_list(videos_to_be_processed, file_path):
    """Dump videos to be processed to the text file."""
    with open(file_path, "w", encoding="utf-8") as f:
        for item in videos_to_be_processed:
            f.write("%s\n" % item)
    return os.path.abspath(file_path)
