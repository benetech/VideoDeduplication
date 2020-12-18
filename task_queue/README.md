# Celery Task Queue Package

## Development

To run a stand-alone celery worker locally you'll need a broker (e.g. `redis`):
```shell
sudo docker run -d -p 6379:6379 --name winnow-redis redis
```

or if you already have `winnow-redis` container
```shell
sudo docker start winnow-redis
```

Run celery worker:
```shell
celery -A task_queue.application worker --loglevel=INFO
```

Test worker:
```python
from task_queue.tasks import run_pipeline
run_pipeline.delay().get(timeout=2)
```
