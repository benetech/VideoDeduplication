import json

import redis


class CeleryRedisBackend:
    _WINNOW_KEY_PREFIX = "winnow-task-meta-"
    _CELERY_KEY_PREFIX = "celery-task-meta-"

    def __init__(self, app, url):
        self._app = app
        self._url = url
        self._client = redis.Redis.from_url(url)

    def store_task_meta(self, task_id: str, meta: dict):
        self._client.set(
            self._meta_key(task_id),
            json.dumps(meta),
        )

    def get_task_meta(self, task_id):
        serialized_meta = self._client.get(self._meta_key(task_id))
        if serialized_meta is None:
            return None
        return json.loads(serialized_meta)

    def delete_task_meta(self, task_id):
        self._client.delete(self._meta_key(task_id))

    def task_ids(self):
        for key in self._client.keys(self._meta_key("*")):
            yield self._id_from_meta_key(key.decode("utf-8"))

    def exists(self, task_id):
        return self._client.exists(self._meta_key(task_id))

    def _meta_key(self, task_id):
        return f"{self._WINNOW_KEY_PREFIX}{task_id}"

    def _id_from_meta_key(self, meta_key):
        return meta_key[len(self._WINNOW_KEY_PREFIX) :]
