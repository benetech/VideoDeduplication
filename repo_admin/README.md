# Fingerprint Repository Management Tool

## Installation

```shell
python -m pip install --upgrade pip
pip install --upgrade justiceai-repo-admin
```

## Basic Usage

### Managing repositories

Save repository credentials:
```shell
repo-admin add --name=central --host=localhost --port=5432 --database=example --username=postgres
```

All credentials will be stored at `~/.benetech-repo-admin`.

List saved repos:
```shell
repo-admin repo list
```
```
REPOSITORY NAME
central
```

Delete repository credentials:
```shell
repo-admin delete --repo=central
```

Initialize repository database schema:
```shell
repo-admin init --repo=central
```

Drop repository database schema:
```shell
repo-admin drop --repo=central
```

### Manage Users

List users for the given repository:
```shell
repo-admin user list --repo=central
```

Add user for the given repository:
```shell
repo-admin user add --repo=central [--username=<name>] [--password=<password>]
```

If `username` or `password` are not specified, 
random values will be generated and printed to the console.

Delete user from the repository:
```shell
repo-admin user delete --repo=central --username=<contributor-name> [--force]
```

Update user password:
```shell
repo-admin user update --repo=central --contributor=electric_vulture [--new_password=<password>]
```

If `new_password` is not specified a new random password will be generated.

## Development

### Setup Development Environment

Checkout the repository:
```shell 
git clone git@github.com:benetech/VideoDeduplication.git
cd VideoDeduplication/repo_admin
```

Make an 'editable' installation with dev dependencies:
```shell
pip install -e .[dev]
```

### Testing

Execute unit-tests:
```shell
pytest tests
```

Execute integration tests:
```shell
pytest --integration --database_uri=<test-database-uri>
```
