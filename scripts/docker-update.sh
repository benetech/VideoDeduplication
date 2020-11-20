#!/usr/bin/env bash

# This script updates the docker-images used by the application.

if ! [ -f ".env" ]; then
  echo -e "\e[31mERROR\e[0m Environment file not found: $(pwd)/.env"
  echo -e "\e[31mERROR\e[0m Please run script/docker-setup.sh first."
  exit 1
fi

source .env

if ! [ -d "$BENETECH_DATA_LOCATION" ] || [ -z "$BENETECH_RUNTIME" ] || [ -z "$BENETECH_PREBUILT" ]; then
  echo -e "\e[31mERROR\e[0m Environment file is incomplete."
  echo -e "\e[31mERROR\e[0m Please run script/docker-setup.sh first."
  exit 1
fi


if [ "$BENETECH_RUNTIME" = "GPU" ] && [ "$BENETECH_PREBUILT" = "NO" ]; then
  set -x
  sudo docker-compose rm -s -f
	sudo docker-compose build --parallel --no-cache
elif [ "$BENETECH_RUNTIME" = "CPU" ] && [ "$BENETECH_PREBUILT" = "NO" ]; then
  set -x
  sudo docker-compose rm -s -f
  sudo docker-compose -f docker-compose.yml -f docker-compose/build.cpu.yml build
elif [ "$BENETECH_RUNTIME" = "GPU" ] && [ "$BENETECH_PREBUILT" = "YES" ]; then
  set -x
  sudo docker-compose rm -s -f
  sudo docker-compose -f docker-compose.yml -f docker-compose/prebuilt.yml pull
elif [ "$BENETECH_RUNTIME" = "CPU" ] && [ "$BENETECH_PREBUILT" = "YES" ]; then
  set -x
  sudo docker-compose rm -s -f
  sudo docker-compose -f docker-compose.yml -f docker-compose/prebuilt.cpu.yml pull
fi
