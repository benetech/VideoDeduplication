import fire
from flask import Flask

from api import api as api_blueprint
from config import Config
from model import database


def connection(config):
    """Get database connection URI."""
    db = config.database
    return f"postgres://{db.user}:{db.password}@{db.host}:{db.port}/{db.name}"


def create_application(config):
    """Create configured flask application."""
    app = Flask(__name__, static_url_path="", static_folder=config.static_folder)

    app.config['SQLALCHEMY_DATABASE_URI'] = connection(config)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.register_blueprint(api_blueprint, url_prefix='/api/v1')

    @app.route('/')
    def root():
        return app.send_static_file('index.html')

    return app


def serve(host=None, port=None, db_host=None, db_port=None, db_name=None, db_user=None, db_secret=None):
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

    # Create application
    application = create_application(config)

    # Initialize database
    database.init_app(application)

    # Serve REST API
    application.run(host=config.host, port=config.port)


if __name__ == "__main__":
    fire.Fire(serve)
