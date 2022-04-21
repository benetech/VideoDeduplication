# Server

Server provides REST API and user interface for Video Deduplication app.

## Installation 

*Requires Python version 3.8 or above.*

```
pip install -r requirements.txt
```

## Running the Server

Execute 
```
python -m server.main
```

To get help:
```
python -m server.main --help 
```

## Configuration

Server honors the following environment variables:
 * `SERVER_HOST` - set server host (default is `0.0.0.0`)
 * `SERVER_PORT` - set server port (default is `5000`)
 * `STATIC_FOLDER` - set the folder with static assets (default is `static`)
 * `DATABASE_HOST` - set database host (default is `localhost`)
 * `DATABASE_PORT` - set database port (default is `5432`)
 * `DATABASE_NAME` - set database name (default is `videodeduplicationdb`)
 * `DATABASE_USER` - set database user (default is `postgres`)
 * `DATABASE_PASS` - set the database password (default is empty string)
 * `DATABASE_SECRET` - if specified, the server will read database password from that file
 * `DATABASE_DIALECT` - set the database dialect (default is `postgres`)
 * `DATABASE_URI` - set the database connection URI (if specified, other `DATABASE_*` variables will be ignored)
 * `VIDEO_FOLDER` - folder with video-files to serve
 * `DUPLICATE_DISTANCE` - maximal distance between duplicate videos (default is `0.1`)
 * `RELATED_DISTANCE` - maximal distance between related videos (default is `0.4`) 
 * `THUMBNAIL_CACHE_FOLDER` - folder in which thumbnails will be stored (default is `thumbnails_cache`)
 * `THUMBNAIL_CACHE_CAP` - maximal number of thumbnails to be cached (default is `1000`)
 * `TASK_LOG_DIRECTORY` - directory in which background task logs are located (default is `./task_logs`)
 * `TASK_QUEUE_TYPE` - task queue backend. Possible values are `celery` or `fake` (default is `celery`) 
 * `CELERY_BROKER` - Celery message broker uri. Ignored if `TASK_QUEUE_TYPE` is not `celery` (default is `redis://localhost:6379/0`)
 * `CELERY_RESULT_BACKEND` - Celery result backend. Ignored if `TASK_QUEUE_TYPE` is not `celery` (default is `redis://localhost:6379/0`)
 * `FILE_STORE_DIRECTORY` - Directory in which the application files (e.g. template examples) will be stored (default is `./app_files`)
 * `MAX_UPLOAD_SIZE` - Maximal upload file size in bytes (default is `20971520`, i.e. 20MB)
 * `ALLOWED_ORIGINS` - Optional comma-separated list of allowed origins. 
 * `ONLINE_POLICY` - Online detection policy. Possible values are `online`, `offline` and `detect` (default is `detect`)
 * `SECURITY_STORAGE_PATH` - Directory in which third-party credentials are stored (default is `./`).
 * `SECURITY_MASTER_KEY_PATH` - File path in which master key for third-party credentials is stored (unset by default).
 * `RPC_SERVER_HOST` - Hostname of the RPC Server (RPC provides online data processing services, default is `localhost`)
 * `RPC_SERVER_PORT` - RPC Server port
 * `REDIS_CACHE_HOST` - redis cache host (default is `redis`)
 * `REDIS_CACHE_PORT` - redis cache port (default `6379`)
 * `REDIS_CACHE_DB` - redis cache db (default is `0`)
 * `EMBEDDINGS_FOLDER` - folder with embeddings tiles (default is `./embeddings`)


Server accepts the following command-line arguments:
 * `--help` - print usage
 * `--host=HOST` - set server host (overrides `SERVER_HOST` variable)
 * `--port=PORT` - set server port (overrides `SERVER_PORT` variable)
 * `--db_host=DB_HOST` - set database host (overrides `DATABASE_HOST` variable)
 * `--db_port=DB_PORT` - set database port (overrides `DATABASE_PORT` variable)
 * `--db_name=DB_NAME` - set database name (overrides `DATABASE_NAME` variable)
 * `--db_user=DB_USER` - set database user (overrides `DATABASE_USER` variable)
 * `--db_secret=DB_SECRET` - if specified, the server will read database password from that file
 (overrides `DATABASE_SECRET` variable)
 * `--db_dialect` - set database dialect (overrides `DATABASE_DIALECT` variable)
 * `--db_uri` - set database connection URI (overrides the other `DATABASE_*` variables and `--db_*` flags)
 * `--static` - set location of directory with static resources (overrides `STATIC_FOLDER` variable)
 * `--videos` - set location of video files (overrides `VIDEO_FOLDER` variable)
 * `--online_policy` - set server online detection policty (overrices `ONLINE_POLICY` variable)
 * `--security_storage_path` - set directory in which third-party credentials are stored (overrides `SECURITY_STORAGE_PATH` varialbe)
 * `--security_master_key_path` - set file path in which master key for third-party credentials is stored (overrides `SECURITY_MASTER_KEY_PATH` variable)
 * `--rpc_server_host` - set the rpc-server host to connect to (overrides `RPC_SERVER_HOST` variable)
 * `--rpc_server_port` - set the rpc-server port (overrides `RPC_SERVER_PORT` variable)
 * `--redis_cache_host` - set the redis cache host (overrides `REDIS_CACHE_HOST` variable)
 * `--redis_cache_port` - set the redis cache port (overrides `REDIS_CACHE_PORT` variable)
 * `--redis_cache_db` - set the redis cache db (overrides `REDIS_CACHE_DB` variable)

## Serving Frontend

Build frontend project (in the `../web` directory):
```
npm install
npm run build
```

Run server and point to the frontend build directory with `STATIC_FOLDER` environment variable
```bash
export STATIC_FOLDER="../web/build" 
python -m server.main 
```

Or specify `--static` argument
```
python -m server.main --static ../web/build
```

## Run Tests

Install dev-dependencies:
```
pip install -r requirements-dev.txt
```

Server uses [pytest](https://docs.pytest.org/en/stable/getting-started.html) framework. 
To run tests simply execute
```
pytest
```
