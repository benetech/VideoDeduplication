"""The network module offers high-level network operations."""
import shutil

import requests


def download_file(local_filename, url, buf_size=8 * 1024):
    """Download file to the local file-system."""
    with requests.get(url, stream=True) as request:
        request.raise_for_status()
        with open(local_filename, "wb") as file:
            shutil.copyfileobj(request.raw, file, length=buf_size)
        return local_filename
