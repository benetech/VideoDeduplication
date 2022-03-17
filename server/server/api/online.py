import socket

from flask import jsonify

from .blueprint import api
from .helpers import get_config
from ..config import OnlinePolicy

GOOGLE_PUBLIC_DNS_HOST = "8.8.8.8"
GOOGLE_PUBLIC_DNS_PORT = 53


def check_online(host=GOOGLE_PUBLIC_DNS_HOST, port=GOOGLE_PUBLIC_DNS_PORT, timeout=5) -> bool:
    """Do check internet connection by trying to connect to well-known server."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        sock.connect((host, port))
        return True
    except socket.error:
        return False
    finally:
        sock.close()


def is_online() -> bool:
    """Get online status."""
    config = get_config()
    if config.online_policy == OnlinePolicy.OFFLINE:
        return False
    elif config.online_policy == OnlinePolicy.ONLINE:
        return True
    else:  # OnlinePolicy.DETECT
        return check_online()


@api.route("/online/", methods=["GET"])
def get_online():
    return jsonify({"online": is_online()})
