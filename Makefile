
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

.PHONY: rebuild

## Rebuild docker-compose images
rebuild: docker-rebuild

.PHONY: update

## Update images of the docker-compose application
update: docker-update

.PHONY: purge

## Remove docker-compose application and all its images and volumes.
purge: docker-purge

# Define default goal
.DEFAULT_GOAL := help
