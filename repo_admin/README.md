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
repo-admin repo add --repo_name=central --host=localhost --port=5432 --user=postgres --dbname=example
```

All credentials will be stored at `~/.benetech-repo-admin`.

List saved repos:
```shell
repo-admin repo list
```

Delete repository credentials:
```shell
repo-admin repo delete --repo_name=central
```

Initialize repository database schema:
```shell
repo-admin repo init --repo_name=central
```

Drop repository database schema:
```shell
repo-admin repo drop --repo_name=central
```

### Manage Users

List users for the given repository:
```shell
repo-admin user list --repo=central
```

Add user for the given repository:
```shell
repo-admin user add --repo=central [--contributor_name=<name>] [--contributor_password=<password>]
```

If `contributor_name` or `contributor_password` are not specified, 
random values will be generated and printed to the console.

Delete user from the repository:
```shell
repo-admin user delete --repo=central --contributor_name=hungry_dolphin
```

Update user password:
```shell
repo-admin user update --repo=central --contributor_name=electric_vulture
```
