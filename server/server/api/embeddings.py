import json
import os
import re
from datetime import datetime
from functools import lru_cache
from http import HTTPStatus
from json import JSONDecodeError
from os.path import dirname, basename
from typing import Optional, Tuple, Dict, List

from dataclasses import dataclass, asdict
from flask import abort, send_from_directory, jsonify, request

import rpc.rpc_pb2 as proto
from db.access.files import FilesDAO
from db.schema import Files
from server import time_utils
from .blueprint import api
from .helpers import (
    get_config,
    parse_positive_int,
    embeddings_rpc,
)
from ..model import database, Transform


@dataclass
class TilesBBox:
    """Bounding box of embedding space covered by tiles collection."""

    x: Tuple[float, float]
    y: Tuple[float, float]


@dataclass
class TilesInfo:
    """Tiles collection descriptor."""

    algorithm: str
    available: bool
    max_zoom: Optional[int] = None
    last_update: Optional[datetime] = None
    bbox: Optional[TilesBBox] = None
    point_size: Optional[float] = None

    def json_data(self) -> Dict:
        """Covert to json data."""
        data = asdict(self)
        if self.last_update is not None:
            data["last_update"] = time_utils.dumps(self.last_update)
        return data


class TilesStorage:
    """Class to provide access to tile collections for different embeddings algorithms."""

    DATE_FORMAT = "%Y_%m_%d_%H%M%S%f"
    COLL_FORMAT = r"^tiles_(?P<zoom>\d+)zoom__(?P<time>.+)\.d$"
    TILE_FORMAT = "zoom_{zoom}/tile_{x}_{y}.png"
    DETAILS_FILE = "details.json"
    BLANK_TILE = "blank.png"

    def __init__(
        self,
        parent_dir: str,
        date_format: str = DATE_FORMAT,
        coll_format: str = COLL_FORMAT,
        tile_format: str = TILE_FORMAT,
        details_file_path: str = DETAILS_FILE,
        blank_tile_path: str = BLANK_TILE,
    ):
        self._parent_dir: str = parent_dir
        self._date_format: str = date_format
        self._coll_pattern: re.Pattern = re.compile(coll_format)
        self._tile_format: str = tile_format
        self._details_file_path: str = details_file_path
        self._blank_tile_path: str = blank_tile_path

    def _parse_coll(self, folder_name: str) -> Tuple[Optional[int], Optional[datetime]]:
        """Parse tiles collection folder name."""
        match = self._coll_pattern.match(folder_name)
        if not match:
            return None, None
        try:
            zoom = int(match.group("zoom"))
            time = datetime.strptime(match.group("time"), self._date_format)
            return zoom, time
        except (ValueError, TypeError):
            return None, None

    def _find_coll(
        self,
        algorithm: str,
        zoom: Optional[int] = None,
    ) -> Tuple[Optional[str], Optional[int], Optional[datetime]]:
        """Find appropriate tiles collection."""
        parent_dir = os.path.join(self._parent_dir, algorithm)
        if not os.path.isdir(parent_dir):
            return None, None, None
        best_coll_path, best_coll_time, best_coll_zoom = None, None, None
        for coll_folder_name in os.listdir(parent_dir):
            max_zoom, time = self._parse_coll(coll_folder_name)
            if max_zoom is None:  # not a tiles collection
                continue
            if zoom is not None and max_zoom < zoom:  # insufficient max zoom
                continue
            if best_coll_time is None or time > best_coll_time:
                best_coll_path = os.path.join(parent_dir, coll_folder_name)
                best_coll_zoom = max_zoom
                best_coll_time = time
        return best_coll_path, best_coll_zoom, best_coll_time

    def _tile_inner_path(self, zoom: int, x: int, y: int) -> str:
        """Get tile path inside tile collection folder."""
        return self._tile_format.format(zoom=zoom, x=x, y=y)

    def tile_path(self, algorithm: str, zoom: int, x: int, y: int) -> Optional[str]:
        """Get path to the requested tile."""
        coll_path, _, _ = self._find_coll(algorithm, zoom)
        if coll_path is None:
            return None
        inner_path = self._tile_inner_path(zoom, x, y)
        tile_path = os.path.join(coll_path, inner_path)
        if not os.path.isfile(tile_path):
            tile_path = os.path.join(coll_path, self._blank_tile_path)
        return tile_path

    def info(self, algorithm: str, zoom: Optional[int] = None) -> TilesInfo:
        """Get tiles collection info."""
        coll_path, max_zoom, update_time = self._find_coll(algorithm, zoom)
        if coll_path is None:
            return TilesInfo(algorithm=algorithm, available=False)
        details_path = os.path.join(coll_path, self._details_file_path)
        if not os.path.isfile(details_path):
            return TilesInfo(algorithm=algorithm, available=False)
        try:
            with open(details_path, "r") as details_file:
                details_data = json.load(details_file)
                bbox = TilesBBox(**details_data["bbox"])
                return TilesInfo(
                    algorithm=algorithm,
                    available=True,
                    max_zoom=max_zoom,
                    last_update=update_time,
                    bbox=bbox,
                    point_size=details_data["point_size"],
                )
        except (JSONDecodeError, TypeError):
            return TilesInfo(algorithm=algorithm, available=False)


@lru_cache()
def get_tiles_storage() -> TilesStorage:
    """Get tiles storage."""
    config = get_config()
    return TilesStorage(parent_dir=config.embeddings_folder)


@api.route("/embeddings/<string:algorithm>/tiles/<signed_int:zoom>/<signed_int:x>/<signed_int:y>", methods=["GET"])
def get_tile(algorithm: str, zoom: int, x: int, y: int):
    tiles_storage = get_tiles_storage()
    tile_path = tiles_storage.tile_path(algorithm, zoom, x, y)
    if tile_path is None or not os.path.isfile(tile_path):
        abort(HTTPStatus.NOT_FOUND.value, f"Tile is missing: {algorithm}/tiles/{zoom}/{x}/{y}")
    return send_from_directory(dirname(tile_path), basename(tile_path))


@api.route("/embeddings/<string:algorithm>/tiles/info", methods=["GET"])
def get_tiles_info(algorithm):
    """Get tiles metadata."""
    tiles_storage = get_tiles_storage()
    response = tiles_storage.info(algorithm).json_data()
    return jsonify(response)


@api.route("/embeddings/<string:algorithm>/neighbors", methods=["GET"])
def get_neighbors(algorithm):
    """Get tiles metadata."""
    max_count = parse_positive_int(request.args, "max_count", 20)
    max_distance = request.args.get("max_distance", default=-1.0, type=float)
    if "x" not in request.args:
        abort(HTTPStatus.BAD_REQUEST.value, "Missing required argument: x")
    if "y" not in request.args:
        abort(HTTPStatus.BAD_REQUEST.value, "Missing required argument: y")
    x = request.args.get("x", type=float)
    y = request.args.get("y", type=float)
    with embeddings_rpc() as embeddings_service:
        response = embeddings_service.query_nearest_neighbors(
            proto.NearestNeighborsRequest(
                algorithm=algorithm,
                x=x,
                y=y,
                max_count=max_count,
                max_distance=max_distance,
            )
        )
    neighbors: List[proto.FoundNeighbor] = response.neighbors
    files_index = load_files(neighbors)
    results = []
    for neighbor in neighbors:
        file = files_index.get((neighbor.file_path, neighbor.file_hash))
        if file is None:
            continue
        results.append(
            {
                "file": Transform.file(file, exif=True),
                "distance": neighbor.distance,
                "x": neighbor.x,
                "y": neighbor.y,
            }
        )
    return jsonify(results)


def load_files(neighbors: List[proto.FoundNeighbor]) -> Dict[Tuple[str, str], Files]:
    """Load found files from the database."""
    path_hash_pairs = []
    for neighbor in neighbors:
        path_hash_pairs.append((neighbor.file_path, neighbor.file_hash))
    files: List[Files] = FilesDAO.query_local_files(database.session, path_hash_pairs).all()
    files_index: Dict[Tuple[str, str], Files] = {}
    for file in files:
        files_index[(file.file_path, file.sha256)] = file
    return files_index
