from urllib.parse import urlparse

from server.queue.celery.redis_backend import CeleryRedisBackend

# Known Celery Backends
_SUPPORTED_BACKENDS = {"redis": CeleryRedisBackend}


def resolve_backend(celery_app):
    scheme = urlparse(celery_app.backend.url).scheme
    if scheme not in _SUPPORTED_BACKENDS:
        raise ValueError(f"Unsupported Celery backend: {scheme}")
    backend_type = _SUPPORTED_BACKENDS[scheme]
    return backend_type(celery_app, celery_app.backend.url)
