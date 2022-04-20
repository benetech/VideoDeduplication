import threading
from os import path

import eventlet
import fire
import redis
from flask import Flask

from server.cache import FileQueryCache, RedisCache, NoCache
from server.config import Config, OnlinePolicy, CacheConfig
from server.socket.log_watcher import LogWatcher
from server.socket.task_observer import TaskObserver
from template_support.file_storage import LocalFileStorage
from thumbnail.cache import ThumbnailCache


def _setup_frontend(app, basename=""):
    """Setup routing for single-page frontend"""

    @app.route(path.join(basename, "/"), defaults={"_": None})
    @app.route(path.join(basename, "/<path:_>"))
    def frontend(_):
        return app.send_static_file("index.html")


def create_application(config):
    """Create configured flask application."""
    from server.api import api as api_blueprint
    from werkzeug.routing import IntegerConverter

    class SignedIntConverter(IntegerConverter):
        regex = r"-?\d+"

    app = Flask(__name__, static_url_path="/static", static_folder=path.abspath(config.static_folder))
    app.url_map.converters["signed_int"] = SignedIntConverter

    app.debug = False
    app.config["SQLALCHEMY_DATABASE_URI"] = config.database.uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["MAX_CONTENT_LENGTH"] = config.max_upload_size
    app.config["CONFIG"] = config
    app.config["THUMBNAILS"] = ThumbnailCache(
        directory=config.thumbnail_cache_folder, capacity=config.thumbnail_cache_cap
    )

    app.register_blueprint(api_blueprint, url_prefix="/api/v1")

    _setup_frontend(app)

    return app


def create_cache(config: CacheConfig) -> FileQueryCache:
    """Create files-query cache."""
    if config.port and config.host:
        return RedisCache(client=redis.Redis(host=config.host, port=config.port, db=config.db))
    return NoCache()


def serve(
    host=None,
    port=None,
    db_host=None,
    db_port=None,
    db_name=None,
    db_user=None,
    db_secret=None,
    db_dialect=None,
    db_uri=None,
    static=None,
    videos=None,
    online_policy=None,
    security_storage_path=None,
    security_master_key_path=None,
    rpc_server_host=None,
    rpc_server_port=None,
    redis_cache_host=None,
    redis_cache_port=None,
    redis_cache_db=None,
):
    """Start Deduplication API Server."""
    eventlet.monkey_patch()

    from server.model import database
    from server.queue.instance import request_transformer
    from server.socket.instance import socketio
    from server.queue import make_task_queue, make_log_storage

    # Read configuration
    config = Config()
    config.port = port or config.port
    config.host = host or config.host
    config.video_folder = videos or config.video_folder
    config.static_folder = static or config.static_folder
    config.online_policy = OnlinePolicy.parse(online_policy, config.online_policy)
    config.security_storage_path = security_storage_path or config.security_storage_path
    config.master_key_path = security_master_key_path or config.master_key_path
    config.database.port = db_port or config.database.port
    config.database.host = db_host or config.database.host
    config.database.name = db_name or config.database.name
    config.database.user = db_user or config.database.user
    config.database.secret = db_secret or config.database.secret
    config.database.dialect = db_dialect or config.database.dialect
    config.database.override_uri = db_uri or config.database.override_uri
    config.rpc_server.host = rpc_server_host or config.rpc_server.host
    config.rpc_server.port = rpc_server_port or config.rpc_server.port
    config.cache.host = redis_cache_host or config.cache.host
    config.cache.port = redis_cache_port or config.cache.port
    config.cache.db = redis_cache_db or config.cache.db

    # Create application
    application = create_application(config)

    # Initialize database
    database.init_app(application)

    # Initialize file storage
    application.config["APP_FILE_STORAGE"] = LocalFileStorage(directory=config.file_store_directory)

    # Initialize task queue
    task_queue = make_task_queue(config, request_transformer)
    application.config["TASK_QUEUE"] = task_queue

    # Initialize SocketIO
    socketio.init_app(application)
    task_queue.observe(TaskObserver(socketio))

    # Initialize task log storage
    log_storage = make_log_storage(config, task_queue)
    application.config["LOG_STORAGE"] = log_storage

    # Initialize task log watcher
    log_watcher = LogWatcher(socketio=socketio, log_storage=log_storage)
    application.config["LOG_WATCHER"] = log_watcher

    application.config["FILE_QUERY_CACHE"] = create_cache(config.cache)

    # Listen for task queue events in a background thread
    threading.Thread(target=task_queue.listen, daemon=True).start()

    # Publish log updates in a background thread
    threading.Thread(target=log_watcher.broadcast_logs, daemon=True).start()

    # Serve REST API
    socketio.run(application, host=config.host, port=config.port, log_output=True)


if __name__ == "__main__":
    fire.Fire(serve)
