#!/usr/bin/env bash

# This script runs docker-compose application
# according to the .env configuration.

export BENETECH_MODE=""
export BENETECH_GET_IMAGE_METHOD="PULL_PROD"

if [ -f ".env" ]; then
  source .env
fi


# Check this is the first run
function first-run() {
  local IMAGES_COUNT="$(sudo docker-compose images 2>/dev/null | tail -n +3 | wc -l)"
  local SERVICE_COUNT="$(sudo docker-compose ps --services | wc -l)"
  (( $IMAGES_COUNT < $SERVICE_COUNT ))
}

# Obtain images according to the user preferences
if first-run; then
  # If this is the first run in dev-mode, we need either to build  or pull dev images
  if [ "$BENETECH_GET_IMAGE_METHOD" = "PULL_PROD" ]; then
    echo "Pulling the latest stable Docker images for missing services."
    sudo docker-compose pull
  elif [ "$BENETECH_GET_IMAGE_METHOD" = "PULL_DEV" ]; then
    echo "Pulling bleeding-edge Docker images for missing services."
    sudo docker-compose pull
  elif [ "$BENETECH_GET_IMAGE_METHOD" = "BUILD" ]; then
    echo "Building Docker images from local sources for missing services."
    sudo docker-compose rm -s -f
    sudo docker-compose build --build-arg GIT_HASH="$(git rev-parse --short HEAD)" --parallel
  else
    echo "BENETECH_GET_IMAGE_METHOD variable must be either 'PULL' nor 'BUILD', but its value is '$BENETECH_GET_IMAGE_METHOD'"
    echo "Did you forget to run 'make setup'?"
    exit 1
  fi
fi

sudo docker-compose up "$@"
