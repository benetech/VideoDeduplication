Benetech Video Deduplication Project
==============================

Near Duplicate, object, and metadata detection for video files.

# Installation (Ubuntu with Docker)

### Fetch Codebase

run:

git clone https://github.com/benetech/VideoDeduplication.git

### Install and configure Docker

The easiest, most consistent method for installing Docker on Ubuntu can be found at: https://get.docker.com/

run:

`curl -fsSL https://get.docker.com -o get-docker.sh`

followed by:

`bash get-docker.sh`

Once the above has been completed. Open a command prompt window and type the ‘docker’ command to confirm that the Docker service is available and returning the help guide.

### Enable GPU support for Docker

Assuming docker has been installed run the following command and install the NVIDIA Docker runtime using the script in the main project folder [GPU LINUX ONLY]:

`bash install_nvidia_docker.sh`

### Install docker-compose

run:

`sudo curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`

then modify permissions:

`sudo chmod +x /usr/local/bin/docker-compose`


#### Building and running images

Assuming Docker is has been installed correctly, there are two options:
 
    1. Pulling pre-built images from Dockerhub
    2. Build the Images from the suitable Dockerfile
    
    
#### 1. Pre-Built Images
RUN:
`docker pull johnhbenetech/videodeduplication:gpu`



#### 2. Build VideoDeduplication Image:

`sudo docker build -f Dockerfile-gpu -t wingpu .`


#### Running Docker containers
Once the Image has been built, using Docker-compose allows the environment to be quickly setup with both the required GPU support and database environment. The docker-compose.yml file can be reviewed if you wish to adjust defaults:

`docker-compose up -d `

This will start running both our project and an independend postgres docker instance (check the docker-compose.yaml for additional configuration information).

The command above might throw an error if you already have postgres server running. If that's the case run "systemctl stop postgresql" (Linux) before using docker-compose.

Once the docker-compose is running, you will be able to access the projects notebooks on localhost:8888 and pgadmin on localhost/16543. Check your running instances using this command:

`docker ps`

Take note of the following names: 

    1. App -> "videodeduplication_dedup-app_1"
    2. Postgres Server -> "videodeduplication_postgres_1"
    3. PgAdmin -> "videodeduplication_pgadmin-compose_1"


In order to use Pgadmin, follow these instructions:
   1. go to localhost:1643 and use the credentials as defined on the docker-compose.yml file.
   2. Click create new server
   3. Choose a reference name for the server 
   4. Go the connection tab and set the host name to "videodeduplication_postgres_1", maintenance database to "videodeduplicationdb" and user / password as "postgres" and "admin"


In order to run the main scripts, simply enter the app's docker container by running the following command:

`docker exec -it videodeduplication_dedup-app_1  /bin/bash`

Once within the container, run one of the main scripts as described on the "running" section of this documentation.


### Configuration

This repo contains three main scripts that perform the following tasks:

    1. extract_features.py : Signature extraction Pipeline
    2. generate_matches.py : Signature to Matches (saved as CSV)
    3. template_matching.py: Uses source templates to query the extracted embeddings and generates a report containing potential matches

Important notebooks include (located inside the notebooks folder):

    1. Visualization and Annotation Tool.ipynb: Allows the output of the generate_matches script to be reviewed and annotated.
    2. Template Matching Demo.ipynb: Allows the output of the extract_features script to be queried against known videos / images [as defined in custom templates built by the user]

These scripts use the 'config.yaml' file to define where to collect data from, hyperparameters (...)

**video_source_folder**: Directory where the source video files are located
    
**destination_folder**: Destination of the output files generated from the scripts
    
    
**root_folder_intermediate**: Folder name used for the intermediate representations (Make sure it's compatible with the next paremeter)

**match_distance**: Distance threshold that determines whether two videos are a match [FLOAT - 0.0 to 1.0]
    
**video_list_filename**: Name of the file that contains the list of processed video files (to be saved by the extraction script)
    

**filter_dark_videos**: [true / false] Whether to remove dark videos from final output files.
    
**filter_dark_videos_thr**:[1-10 int range] Ideally a number 1 and 10. Higher numbers means we will less strict when filtering out dark videos.
    
***min_video_duration_seconds**: Minimum video duration in secondds
    
**detect_scenes**: [true / false] Whether to run scene detection or not.
    

**use_pretrained_model_local_path:** [true / false] Whether to use the pretrained model from your local file system
    

**pretrained_model_local_path:**: Absolute path to pretrained model in case the user doesn't want to download it from S3
    
**use_db:** : [true / false]
    true
**conninfo**: Connection string (eg. postgres://[USER]:[PASSWORD]@[URL]:[PORT]/[DBNAME]). When using it using our Docker workflow, URL should default to  "videodeduplication_postgres_1" instead of localhost

**keep_fileoutput:** [true / false]. Whether to keep regular output even with results being saved in DB

**templates_source_path**: Directory where templates of interest are located (should be the path to a directory where each folder contains images related to the template - eg: if set for the path datadrive/templates/, this folder could contain sub-folders like plane, smoke or bomb with its respective images on each folder)

    
### Running 

Within the docker command line

Extract video signatures

`python extract_features.py`

Generate matches

`python generate_matches.py`

Template Object Matching

`python template_matching.py`
