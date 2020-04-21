Winnow Project
==============================

Near Duplicate detection for video files.

# Installation

### Using Docker

Assuming docker has been installed run the following command and install the NVIDIA Docker runtime [GPU LINUX ONLY]:

`bash install_nvidia_docker.sh`

Assuming Docker is has been installed correctly, there are two options:
 
    1. Pulling pre-built images from Dockerhub
    2. Build the Images from the suitable Dockerfile
    
    
#### Pre-Built Images

GPU Version

`docker pull johnhbenetech/videodeduplication:gpu`

CPU version

`docker pull johnhbenetech/videodeduplication:cpu`


#### Building Images

GPU Version

`sudo docker build   -f Dockerfile-gpu -t wingpu .`

CPU version

`sudo docker build   -f Dockerfile-cpu -t wincpu .`


Once the Image has been built, run it by using the following command

GPU version

`sudo docker run --runtime=nvidia -it -p 8888:8888 -v /datadrive:/datadrive [IMAGE_NAME]`

CPU VERSION

`sudo docker run  -it -p 8889:8889 -v /datadrive:/datadrive wincpu`

Within the Image's command line:

`source activate winnow`

This will activate the project's conda environment

The example above the directory "/datadrive" has been mounted to the "/datadrive" path within the Docker image.

Generally, it's useful to use this mounting procedure to allow the Docker environment to interact with the file system that contains the video files subject to analysis

Notice that a binding of ports 8888 was also setup as a way to serve jupyter notebooks from within the Docker container





### Without Docker

Install Conda as instructed on https://www.anaconda.com/distribution/


GPU Version 

`conda env create -f environment-gpu.yaml`

CPU Version 

`conda env create -f environment.yaml`


Activate new conda environment

`conda activate winnow`

or

`conda activate winnow-gpu`

Run jupyter notebook in order visualize examples

`jupyter notebook`



### Configuration

This repo contains three main scripts that perform the following tasks:

    1. extract_features.py : Signature extraction Pipeline
    2. generate_matches.py : Signature to Matches (saved as CSV)
    3. network_vis.py : Saves a visualiation of the generated videos and their matches as a Network system


Important notebooks include (located inside the notebooks folder):

    1. Visualization and Annotation Tool.ipynb: Allows the output of the generate_matches script to be reviewed and annotated.
    2. Template Matching Demo.ipynb: Allows the output of the extract_features script to be queried against known videos / images [as defined in custom templates built by the user]

These scripts use the 'config.yaml' file to define where to collect data from, hyperparameters (...)

**video_source_folder**: Directory where the source video files are located
    
**destination_folder**: Destination of the output files generated from the scripts
    
    
**root_folder_intermediate**: Folder name used for the intermediate representations (Make sure it's compatible with the next paremeter)

    
**video_level_folder**: Folder that contains the video level embeddings generated from the video files

    
**video_signatures_folder**:Folder that contains the video  signatures generated from the video files


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
**conninfo**: Connection string (eg. postgres://[USER]:[PASSWORD]@[URL]:[PORT]/[DBNAME])
    
**keep_fileoutput:** [true / false]. Whether to keep regular output even with results being saved in DB


    
### Running 

Within the docker command line

Extract video signatures

`python extract_features.py`

Generate matches

`python generate_matches.py`

Generate network visualization

`python network_vis.py`


Visualize and annotate results (after running generate matches)

`jupyter notebook`

Choose the Visualization and Annotation tool notebook

Run template matching and visualize results

`jupyter notebook`

Choose the Template Matching Demo notebook

Please note that for the last two examples we used jupyter notebook and not jupyter lab. This is related to the widgets module, which doesn't work on Jupyter Lab. Feel free to use Jupyter Lab for other notebooks.



### Supported Platforms


1. Linux / Ubuntu (Preferred) -- > Docker (CPU / GPU) | CONDA (CPU / GPU)
2. Windows  -- > Docker (CPU) | CONDA (CPU / GPU)
3. MacOS --> Docker (CPU) | CONDA (CPU)





<p><small>Project based on the <a target="_blank" href="https://drivendata.github.io/cookiecutter-data-science/">cookiecutter data science project template</a>. #cookiecutterdatascience</small></p>
