from os import path

import fire
from api import api as api_blueprint
from config import Config
from flask import Flask
from model import database


def setup_frontend(app, basename=''):
    """Setup routing for single-page frontend"""

    @app.route(path.join(basename, '/'), defaults={'_': None})
    @app.route(path.join(basename, '/<path:_>'))
    def frontend(_):
        return app.send_static_file('index.html')


def create_application(config):
    """Create configured flask application."""
    app = Flask(__name__, static_url_path="/static", static_folder=config.static_folder)

    app.config['SQLALCHEMY_DATABASE_URI'] = config.database.uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.register_blueprint(api_blueprint, url_prefix='/api/v1')

    setup_frontend(app)

    return app


def serve(host=None, port=None, db_host=None, db_port=None, db_name=None, db_user=None, db_secret=None, db_dialect=None,
          db_uri=None):
    """Start Deduplication API Server."""

    # Read configuration
    config = Config()
    config.port = port or config.port
    config.host = host or config.host
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

    # Serve REST API
    application.run(host=config.host, port=config.port)


if __name__ == "__main__":
    fire.Fire(serve)
