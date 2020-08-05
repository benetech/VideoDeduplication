
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

## Setup docker-compose application (generate .env file)
setup: docker-setup


# Define default goal
.DEFAULT_GOAL := help
