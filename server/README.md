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
python app.py
```

To get help:
```
python app.py --help 
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

## Serving Frontend

Build frontend project (in the `../web` directory):
```
npm install
npm run build
```

Run server and point to the frontend build directory
```
STATIC_FOLDER=../web/build python app.py
```
