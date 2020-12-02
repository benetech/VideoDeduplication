
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
	sudo docker-compose up -d


.PHONY: docker-stop

## Stop docker-compose application
docker-stop:
	sudo docker-compose stop

.PHONY: docker-build

## Build docker images for docker-compose application
docker-build:
	@scripts/docker-build.sh


.PHONY: docker-rebuild

## Rebuild docker images (don't use local cache).
docker-rebuild:
	@scripts/docker-build.sh --no-cache


.PHONY: docker-pull

## Update docker images (rebuild local or pull latest from repository depending on configuration).
docker-pull:
	sudo docker-compose pull

.PHONY: docker-purge

## Shut-down docker-compose application and remove all its images and volumes.
docker-purge:
	sudo docker-compose down --rmi all -v --remove-orphans --timeout 0
