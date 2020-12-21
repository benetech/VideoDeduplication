import json
from contextlib import contextmanager
from typing import Optional

import redis


class CeleryRedisBackend:
    _WINNOW_KEY_PREFIX = "winnow-task-meta-"
    _CELERY_KEY_PREFIX = "celery-task-meta-"

    def __init__(self, app, url):
        self._app = app
        self._url = url
        self._client = redis.Redis.from_url(url)

    def store_task_meta(self, task_id: str, meta: dict, transaction=None):
        transaction = transaction or self._client
        transaction.set(
            self._meta_key(task_id),
            json.dumps(meta),
        )

    def get_task_meta(self, task_id, transaction=None) -> Optional[dict]:
        transaction = transaction or self._client
        serialized_meta = transaction.get(self._meta_key(task_id))
        if serialized_meta is None:
            return None
        return json.loads(serialized_meta)

    def delete_task_meta(self, task_id, transaction=None):
        transaction = transaction or self._client
        transaction.delete(self._meta_key(task_id))

    def task_ids(self, transaction=None):
        transaction = transaction or self._client
        for key in transaction.keys(self._meta_key("*")):
            yield self._id_from_meta_key(key.decode("utf-8"))

    def exists(self, task_id, transaction=None):
        transaction = transaction or self._client
        return transaction.exists(self._meta_key(task_id))

    def _meta_key(self, task_id):
        return f"{self._WINNOW_KEY_PREFIX}{task_id}"

    def _id_from_meta_key(self, meta_key):
        return meta_key[len(self._WINNOW_KEY_PREFIX) :]

    @contextmanager
    def transaction(self, *task_ids):
        with self._client.pipeline(transaction=True) as pipeline:
            try:
                pipeline.watch(*map(self._meta_key, task_ids))
                yield pipeline
                pipeline.execute()
            finally:
                pipeline.reset()
