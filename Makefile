
# Pull in submodules
include .mk/dedup.mk
include .mk/help.mk
include .mk/docker.mk

# Define shortcuts for some goals

.PHONY: run

## Run application using docker-compose
run: docker-run

.PHONY: stop

## Stop application using docker-compose
stop: docker-stop

.PHONY: setup

## Setup docker-compose application (generate .env file in needed)
setup: docker-setup

.PHONY: update-setup

## Update docker-compose application (regenerate .env file)
setup-update: docker-setup-update

.PHONY: purge

## Remove docker-compose application and all its images and volumes.
purge: docker-purge

# Define default goal
.DEFAULT_GOAL := help

.PHONY: build

## Build Docker images locally.
build: docker-build

.PHONY: pull

## Pull images from Docker Hub
pull: docker-pull
