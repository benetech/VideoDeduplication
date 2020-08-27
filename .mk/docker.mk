
.PHONY: docker-setup

## Setup environment variables required for docker-compose
docker-setup:
	@scripts/docker-setup.sh


.PHONY: docker-run

## Run application using docker-compose
docker-run: docker-setup
	@scripts/docker-run.sh


.PHONY: docker-stop

## Stop docker-compose application
docker-stop:
	sudo docker-compose stop

## Build docker images for docker-compose application
docker-build:
	sudo docker-compose build

## Rebuild docker images
docker-rebuild:
	sudo docker-compose rm -s -f
	sudo docker-compose build
