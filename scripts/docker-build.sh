#!/usr/bin/env bash

# This script builds Docker images from the local
# repository and tag them as development version.

export BENETECH_MODE=""

if [ -f ".env" ]; then
  source .env
fi

if [ "$BENETECH_MODE" = "-dev" ]; then
  set -x
  sudo docker-compose rm -s -f
  sudo docker-compose build --parallel --no-cache
else
  set -x
  sudo docker build --no-cache -t "johnhbenetech/videodeduplication:${BENETECH_RUNTIME:-gpu}-dev" . -f "docker/Dockerfile.dedup-${BENETECH_RUNTIME:-gpu}"
  sudo docker build --no-cache -t "johnhbenetech/videodeduplication:server-dev" . -f "docker/Dockerfile.server"
fi
