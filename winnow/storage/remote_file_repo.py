import logging
import os
import shutil
from glob import glob
from http import HTTPStatus
from os.path import join, abspath, dirname, exists, isfile
from urllib.parse import urljoin

import requests

from winnow.utils.network import download_file

# Default remote file repo logger.
logger = logging.getLogger(__name__)


class BaseUrl:
    """Simple remote file storage serving files with common base URL via HTTP."""

    def __init__(self, base_url, auth=None, headers=None, cookies=None):
        """Create new instance.

        Args:
            base_url: Base URL common for files being served.
            auth: Http authentication method (e.g. HTTPBasicAuth)
            headers: Http headers dictionary.
            cookies: Http cookies dictionary.
        """
        self.base_url = base_url
        self.auth = auth
        self.headers = headers
        self.cookies = cookies

    def _kwargs(self):
        """Get requests kwargs."""
        return dict(auth=self.auth, headers=self.headers, cookies=self.cookies)

    def _resolve(self, relpath):
        """Resolve url of the remote file."""
        return urljoin(self.base_url, relpath)

    def exists(self, relpath):
        """Check if the file exists."""
        resp = requests.head(self._resolve(relpath), auth=self.auth, headers=self.headers, cookies=self.cookies)
        # If operation succeeded, then resource exists.
        if resp.ok:
            return True
        # If resource not found, then it doesn't exist.
        if resp.status_code == HTTPStatus.NOT_FOUND:
            return False
        # Otherwise raise an error
        resp.raise_for_status()

    def download(self, relpath, local_path):
        """Download file to the local file-system."""
        url = self._resolve(relpath)
        download_file(local_path, url)


class RemoteFileRepo:
    """Local cache of remote file storage."""

    def __init__(self, directory, remote):
        """Create a new report instance.

        Args:
            directory: A local directory in which downloaded files will be stored.
            remote: A remote storage (must have exist
        """
        self.remote = remote
        self.directory = abspath(directory)
        if not exists(self.directory):
            logger.info("Creating file repository location: %s", self.directory)
            os.makedirs(self.directory)

    def exists(self, relpath):
        """Check if the file exists."""
        return self.is_local(relpath) or self.remote.exists(relpath)

    def delete(self, relpath):
        """Delete local file."""
        if self.is_local(relpath):
            os.remove(self._resolve_path(relpath))

    def list_local(self):
        """List cached file relative paths (i.e. repo keys as accepted by exists() method)."""
        cached_paths = glob(self._resolve_path("**"), recursive=True)
        return [os.path.relpath(path, self.directory) for path in cached_paths if isfile(path)]

    def clean(self):
        """Remove all local files."""
        shutil.rmtree(self.directory)
        os.makedirs(self.directory)

    def is_local(self, relpath):
        """Check if the file is present in local file cache."""
        return os.path.isfile(self._resolve_path(relpath))

    def download(self, relpath):
        """Download remote file to the local cache."""
        local_path = self._resolve_path(relpath)
        if not exists(dirname(local_path)):
            os.makedirs(dirname(local_path))
        logger.info("Downloading remote file: %s", relpath)
        self.remote.download(relpath, local_path)
        return local_path

    def get(self, relpath):
        """Get cached remote file, auto-download if needed."""
        if not self.is_local(relpath):
            return self.download(relpath)
        return self._resolve_path(relpath)

    def _resolve_path(self, relpath):
        """Resolve path to the local file."""
        return join(self.directory, relpath)
