# Scripts

This directory contains scripts automating common administration tasks.

## Docker-Compose

The following scripts are related to the `docker-compose` configuration:
 * [docker-setup.sh](./docker-setup.sh) - generate [env-file](https://docs.docker.com/compose/env-file/) file used by 
 docker-compose and the [docker-run.sh](./docker-run.sh) script.
 * [docker-run.sh](./docker-run.sh) - run docker-compose configuration. This script will look into the `.env` file 
 at the repository root to pick-up some environment variables and select extensions from 
 [../docker-compose](../docker-compose) directory accordingly. 
