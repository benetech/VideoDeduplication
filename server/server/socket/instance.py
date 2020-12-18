from flask_socketio import SocketIO

socketio = SocketIO(path="/api/v1/socket.io", logger=True, engineio_logger=True)
