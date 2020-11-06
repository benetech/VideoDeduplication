#!/usr/bin/env bash

# This script runs the docker-compose application
# according to the configuration saved in .env file.

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
  sudo docker-compose up -d
elif [ "$BENETECH_RUNTIME" = "CPU" ] && [ "$BENETECH_PREBUILT" = "NO" ]; then
  sudo docker-compose -f docker-compose.yml -f docker-compose/build.cpu.yml up -d
elif [ "$BENETECH_RUNTIME" = "GPU" ] && [ "$BENETECH_PREBUILT" = "YES" ]; then
  sudo docker-compose -f docker-compose.yml -f docker-compose/prebuilt.yml up -d
elif [ "$BENETECH_RUNTIME" = "CPU" ] && [ "$BENETECH_PREBUILT" = "YES" ]; then
  sudo docker-compose -f docker-compose.yml -f docker-compose/prebuilt.cpu.yml up -d
fi
