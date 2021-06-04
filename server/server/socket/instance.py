from flask_socketio import SocketIO

from server.config import Config

socketio = SocketIO(
    path="/api/v1/socket.io",
    logger=True,
    engineio_logger=True,
    cors_allowed_origins=Config.read_allowed_origins(),
)
