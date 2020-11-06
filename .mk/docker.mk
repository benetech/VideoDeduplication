
.PHONY: docker-setup

## Setup environment variables required for docker-compose if needed
docker-setup:
	@scripts/docker-setup.sh

.PHONY: docker-update-setup

## Update environment variables required for docker-compose
docker-update-setup:
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
