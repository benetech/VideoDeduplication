
# Pull in submodules
include .mk/dedup.mk
include .mk/help.mk
include .mk/docker.mk

# Define main goals

.PHONY: run

## Run application
run: docker-run

## Stop application
stop: docker-stop


# Define default goal
.DEFAULT_GOAL := help