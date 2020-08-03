#!/usr/bin/env bash

if ! [ -f ".env" ]; then
  echo -e "\e[31mERROR\e[0m Environment file not found: $(pwd)/.env"
  echo -e "\e[31mERROR\e[0m Please run script/docker-setup.sh first."
  exit 1
fi

source .env

if ! [ -d "$BENETECH_DATA_LOCATION" ] || [ -z "$BENETECH_RUNTIME" ]; then
  echo -e "\e[31mERROR\e[0m Environment file is incomplete."
  echo -e "\e[31mERROR\e[0m Please run script/docker-setup.sh first."
  exit 1
fi

if [ "$BENETECH_RUNTIME" = "GPU" ]; then
  sudo docker-compose up -d
else
  sudo docker-compose -f docker-compose.yml -f docker-compose.cpu.yml up -d
fi
