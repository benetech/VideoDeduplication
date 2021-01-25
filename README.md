<h1 align="center">Benetech Video Deduplication Project</h1>
<p align="center">Near Duplicate, object, and metadata detection for video files.</p> 
<p align="center">
    <a href="https://github.com/benetech/VideoDeduplication/actions?query=workflow%3ACI"><img src="https://github.com/benetech/VideoDeduplication/workflows/CI/badge.svg?branch=development" alt="CI Workflow"></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/benetech/VideoDeduplication.svg" alt="License"></a> 
</p>

- [Installation](#installation-ubuntu-with-docker)
  - [Prerequisites](#prerequisites)
    - [Install and configure Docker](#install-and-configure-docker)
    - [Enable GPU support for Docker](#enable-gpu-support-for-docker)
    - [Install docker-compose](#install-docker-compose)
    - [Fetch Codebase](#fetch-codebase)
  - [Building and Running Application](#building-and-running-application)
    - [Docker-Compose](#docker-compose)
    - [Exploring Application](#exploring-application)
    - [Pre-Built Images](#pre-built-images)
    - [Build Images Manually](#build-images-manually)
- [Configuration](#configuration)
- [Running](#running)

# Installation (Ubuntu with Docker)

## Prerequisites

### Install and configure Docker

The easiest, most consistent method for installing Docker on Ubuntu can be found at: https://get.docker.com/

run:

`curl -fsSL https://get.docker.com -o get-docker.sh`

followed by:

`bash get-docker.sh`

Once the above has been completed. Open a command prompt window and type the ‘docker’ command to confirm that the Docker
service is available and returning the help guide.

### Enable GPU support for Docker

Assuming docker has been installed run the following command and install the NVIDIA Docker runtime using the script in
the main project folder [GPU LINUX ONLY]:

`bash install_nvidia_docker.sh`

### Install docker-compose

Run:

```
sudo curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

then modify permissions:

```
sudo chmod +x /usr/local/bin/docker-compose
```

### Fetch Codebase

```
git clone https://github.com/benetech/VideoDeduplication.git
```

## Building and Running Application

### Docker-Compose

The default approach to build and run the application is to use [docker-compose](https://docs.docker.com/compose/) utility.

Shortcut commands to run the application are:

- `make run` - build and run application
- `make stop` - stop application

The `make run` will ask you the following questions:

- Location of your source video files
- Availability of Nvidia GPU support for Docker (see [Enable GPU support for Docker](#enable-gpu-support-for-docker))
- Whether you want to use pre-built images

The [docker-compose.yml](./docker-compose.yml) configuration [relies](https://docs.docker.com/compose/compose-file/#variable-substitution) on
various environment variables. The only required variable is

- `BENETECH_DATA_LOCATION` - path to the root folder containing your video files.

You can set environment variables in the [.env](https://docs.docker.com/compose/env-file/) file at the repository root folder.

By default docker-compose will build all required containers and assume Nvidia GPU support is available. You can
also use various predefined configuration [extensions](https://docs.docker.com/compose/extends/)
placed in the `./docker-compose` directory (see [./docker-compose/README.md](./docker-compose/README.md))

The `make run` shortcut is a tiny wrapper around the `docker-compose` command which chooses appropriate configuration
[extensions](./docker-compose). If you specified the `BENETECH_DATA_LOCATION` environment variable (either in your shell
or in `.env` file) you can simply execute `sudo docker-compose up -d` to run the default configuration.

The command above might throw an error if you already have postgres server running.
If that's the case run `systemctl stop postgresql` (Linux) before using docker-compose or choose
alternative postgres-port by setting the `BENETECH_PG_PORT` environment variable.

### Exploring Application

Once the docker-compose is running, you will be able to access the following:

- User interface on http://localhost:5000
- projects notebooks on http://localhost:8888
- [pgAdmin](https://www.pgadmin.org/) on http://localhost:16543

You can check your running instances using this command:

```
sudo docker ps
```

Take note of the following names:

1.  Deduplication App -> `videodeduplication_dedup-app_1`
2.  User Interface -> `videodeduplication_server_1`
3.  Postgres Server -> `videodeduplication_postgres_1`
4.  PgAdmin -> `videodeduplication_pgadmin-compose_1`

In order to use pgAdmin, follow these instructions:

1.  go to http://localhost:1643 and use the credentials as defined on the `docker-compose.yml` file.
2.  Click create new server
3.  Choose a reference name for the server
4.  Go the connection tab and set the host name to `postgres`, maintenance database to "videodeduplicationdb" and user / password as `postgres` and `admin`

In order to run the main scripts, simply enter the app's docker container by running the following command:

`docker exec -it videodeduplication_dedup-app_1 /bin/bash`

Once within the container, run one of the main scripts as described on the "running" section of this documentation.

### Pre-Built Images

If you don't want to build Docker images locally you can use prebuilt-images
hosted on [Docker Hub](https://hub.docker.com/r/johnhbenetech/videodeduplication)

If you use `make run` command you can set `BENETECH_PREBUILT=YES` in the `.env` file.

If you use `docker-compose` explicitly you can run:

```
sudo docker-compose -f docker-compose.yml -f docker-compose/prebuilt.yml up -d
```

To pull images run:

```
docker pull johnhbenetech/videodeduplication:gpu
```

### Build Images Manually

You can build and run containers manually:

```
sudo docker build -f docker/Dockerfile.dedup-gpu -t benetech-dedup:gpu .
sudo docker build -f docker/Dockerfile.server -t benetech-server .
```

## Configuration

This repo contains three main scripts that perform the following tasks:

    1. extract_features.py : Signature extraction Pipeline
    2. generate_matches.py : Signature to Matches (saved as CSV)
    3. template_matching.py: Uses source templates to query the extracted embeddings and generates a report containing potential matches
    4. audio_processing.py: Audio processing pipeline developed in collaboration with Microsoft as described on our [wiki](https://github.com/benetech/VideoDeduplication/wiki/Audio-Processing)

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

**\*min_video_duration_seconds**: Minimum video duration in secondds

**detect_scenes**: [true / false] Whether to run scene detection or not.

**use_pretrained_model_local_path:** [true / false] Whether to use the pretrained model from your local file system

**pretrained_model_local_path:**: Absolute path to pretrained model in case the user doesn't want to download it from S3

**use_db:** : [true / false]
true
**conninfo**: Connection string (eg. postgres://[USER]:[PASSWORD]@[URL]:[PORT]/[DBNAME]). When using it using our Docker workflow, URL should default to "videodeduplication_postgres_1" instead of localhost

**keep_fileoutput:** [true / false]. Whether to keep regular output even with results being saved in DB

**templates_source_path**: Directory where templates of interest are located (should be the path to a directory where each folder contains images related to the template - eg: if set for the path datadrive/templates/, this folder could contain sub-folders like plane, smoke or bomb with its respective images on each folder)

## Running

Within the docker command line

Extract video signatures

`python extract_features.py`

Arguments:

    '--config', '-cp' : Path to the project config file [default:'config.yml']
    '--list-of-files', '-lof' : path to txt with a list of files for processing - overrides source folder from the config file
    [default:'']
    '--frame-sampling', '-fs': 'Sets the sampling strategy (values from 1 to 10 - eg sample one frame every X seconds) - overrides frame sampling from the config file' [default:1]
    --save-frames', '-sf': 'Whether to save the frames sampled from the videos - overrides save_frames on the config file'[default:False]

Generate matches

`python generate_matches.py`

Arguments:

    '--config', '-cp' : Path to the project config file [default:'config.yml']
    '--list-of-files', '-lof' : path to txt with a list of files for processing and generating matches / scene detection / metadata extraction - overrides loading all signatures available from the file system

Audio processing

`python audio_processing.py`

Arguments:

    '--config', '-cp' : Path to the project config file [default:'config.yml']
    '--list-of-files', '-lof' : path to txt with a list of files for processing and generating matches / scene detection / metadata extraction - overrides loading all signatures available from the file system
    '--cores', '-' : Number of cores to be used on parallel processing routines [default:5]
    "--model", "-m" : Path to the audio processing model", [default:'data/audio_model.h5']

Template Object Matching

`python template_matching.py`

Arguments:

    '--override', '-ovr' : Overrides the previous template matches saved on the DB [default:False]
    '--template-dir', '-td' : path to a directory containing templates - overrides source folder from the config file'
    [default:'']

Exif Extraction

`python extract_exif.py`


Benchmarks

We have created a few benchmarking scripts to allow performance testing for a few features of the project.

### Video Deduplication

In order to evalute video deduplication, please run the script below:

`python benchmarks/evaluate.py --benchmark augmented_dataset`

This script will download our testing dataset and run our pipeline on it. Results are stress tested using random sampling to create random query/answers pairs at different levels of positive/negative examples (eg. what's the performance of our model when 10% of the content is duplicated? what about at 15%).
The results of the benchmarking script are saved at the root of the data folder.

For more details about our evaluation metric please refer to our [wiki](https://github.com/benetech/VideoDeduplication/wiki/04.-Training-and-Testing#performance-and-reliability)

### Template Matching

In order to evaluate template matching, please run the script below:

`python benchmarks/evaluate.py --benchmark landmarks`

This script will download our subset of the [google landmark dataset](https://github.com/cvdfoundation/google-landmark). Our script uses samples of landmarks to create query templates and runs those templates against random subsets landmarks.

The results of the benchmarking script are saved at the root of
the data folder.




