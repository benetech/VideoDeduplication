# Dockerfile directory

This directory contains [Dockerfiles](https://docs.docker.com/engine/reference/builder/) for all project containers.

You can [build](https://docs.docker.com/engine/reference/commandline/build/) Docker images using the repository root 
directory as a build context. 

**Example**: execute the following command from the repository root directory:
```
sudo docker build -t benetech-server . -f docker/Dockerfile.server
```  

### Images
 * [Dockerfile.dedup-gpu](./Dockerfile.dedup-gpu) - default video deduplication pipeline (using GPU runtime).
 * [Dockerfile.dedup-cpu](./Dockerfile.dedup-cpu) - alternative video deduplication pipeline (fallback to CPU runtime).
 * [Dockerfile.server](./Dockerfile.server) - web-ui server
