
.PHONY: docker-setup

## Setup environment variables required for docker-compose if needed
docker-setup:
	@scripts/docker-setup.sh

.PHONY: docker-setup-update

## Update environment variables required for docker-compose
docker-setup-update:
	@scripts/docker-setup.sh --force-update


.PHONY: docker-run

## Run application using docker-compose
docker-run: docker-setup
	@scripts/docker-run.sh


.PHONY: docker-stop

## Stop docker-compose application
docker-stop:
	sudo docker-compose stop

.PHONY: docker-build

## Build docker images for docker-compose application
docker-build:
	sudo docker-compose build

.PHONY: docker-rebuild

## Rebuild docker images
docker-rebuild:
	sudo docker-compose rm -s -f
	sudo docker-compose build

.PHONY: docker-update

## Update docker images (rebuild local or pull latest from repository depending on configuration).
docker-update:
	@scripts/docker-update.sh

.PHONY: docker-purge

## Shut-down docker-compose application and remove all its images and volumes.
docker-purge:
	sudo docker-compose down --rmi all -v --remove-orphans --timeout 0
