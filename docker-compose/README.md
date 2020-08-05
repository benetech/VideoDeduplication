# `docker-compose` extensions

This directory contains extensions for the default `docker-compose.yml` configuration.

See [Multiple Compose files](https://docs.docker.com/compose/extends/) for more details. 

### Available Extensions
 * [build.cpu.yml](./build.cpu.yml) - fallback to the CPU runtime
 * [prebuilt.yml](./prebuilt.yml) - use pre-built images (use Nvidia GPU for file processing)
 * [prebuilt.cpu.yml](./prebuilt.cpu.yml) - use pre-built images (use CPU for file processing)


### Example Usage

Run application with pre-built images: 
```
sudo docker-compose -f docker-compose.yml -f docker-compose/prebuilt.yml up
```

Run application with pre-built images using CPU runtime: 
```
sudo docker-compose -f docker-compose.yml -f docker-compose/prebuilt.cpu.yml up
```

Build images from sources and use CPU runtime:
```
sudo docker-compose -f docker-compose.yml -f docker-compose/build.cpu.yml up
```
