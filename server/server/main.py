import threading
from os import path

import eventlet
import fire
from flask import Flask

from server.config import Config
from server.queue.celery.task_log_storage import TaskLogStorage
from server.socket.log_watcher import LogWatcher
from server.socket.task_observer import TaskObserver
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

    app = Flask(__name__, static_url_path="/static", static_folder=path.abspath(config.static_folder))

    app.debug = False
    app.config["SQLALCHEMY_DATABASE_URI"] = config.database.uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["CONFIG"] = config
    app.config["THUMBNAILS"] = ThumbnailCache(
        directory=config.thumbnail_cache_folder, capacity=config.thumbnail_cache_cap
    )

    app.register_blueprint(api_blueprint, url_prefix="/api/v1")

    _setup_frontend(app)

    return app


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
):
    """Start Deduplication API Server."""
    eventlet.monkey_patch()

    from server.model import database
    from server.queue.instance import queue
    from server.socket.instance import socketio

    # Read configuration
    config = Config()
    config.port = port or config.port
    config.host = host or config.host
    config.video_folder = videos or config.video_folder
    config.static_folder = static or config.static_folder
    config.database.port = db_port or config.database.port
    config.database.host = db_host or config.database.host
    config.database.name = db_name or config.database.name
    config.database.user = db_user or config.database.user
    config.database.secret = db_secret or config.database.secret
    config.database.dialect = db_dialect or config.database.dialect
    config.database.override_uri = db_uri or config.database.override_uri

    # Create application
    application = create_application(config)

    # Initialize database
    database.init_app(application)

    # Initialize SocketIO
    socketio.init_app(application)
    queue.observe(TaskObserver(socketio))

    # Initialize task log storage
    log_storage = TaskLogStorage(directory=config.task_log_directory)
    queue.observe(log_storage.make_task_observer())
    application.config["LOG_STORAGE"] = log_storage

    # Initialize task log watcher
    log_watcher = LogWatcher(socketio=socketio, log_storage=log_storage)
    application.config["LOG_WATCHER"] = log_watcher

    # Listen for task queue events in a background thread
    threading.Thread(target=queue.listen, daemon=True).start()

    # Publish log updates in a background thread
    threading.Thread(target=log_watcher.publish_log_updates, daemon=True).start()

    # Serve REST API
    socketio.run(application, host=config.host, port=config.port, log_output=True)


if __name__ == "__main__":
    fire.Fire(serve)
