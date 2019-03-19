Winnow Project
==============================

Near Duplicate detection for video files.

# Installation

### Using Docker

Assuming docker has been installed run the following command and install the NVIDIA Docker runtime:

`bash install_nvidia_docker.sh`

After the runtime has been installed, build the Docker Image using the provided Dockerfile

`sudo docker build  -t [IMAGE_NAME] . `


Once the Image has been built, run it by using the following command

`sudo docker run --runtime=nvidia -it -p 8888:8888 -v /datadrive:/datadrive [IMAGE_NAME]`

The example above the directory "/datadrive" has been mounted to the "/datadrive" path within the Docker image.

Generally, it's useful to use this mounting procedure to allow the Docker environment to interact with the file system that contains the video files subject to analysis

Notice that a binding of ports 8888 was also setup as a way to serve jupyter notebooks from within the Docker container

### Without Docker

Install Conda as instructed on https://www.anaconda.com/distribution/



`conda env create -f environment.yaml`


Activate new conda environment

`conda activate winnow`

Run jupyter notebook in order visualize examples

`jupyter notebook`



### Configuration

This repo contains three main scripts that perform the following tasks:

    1. extract_features.py : Signature extraction Pipeline
    2. generate_matches.py : Signature to Matches (saved as CSV)
    3. network_vis.py : Saves a visualiation of the generated videos and their matches as a Network system

These scripts use the 'config.yaml' file to define where to collect data from, hyperparameters (...)

**video_source_folder**: Directory where the source video files are located
    
**destination_folder**: Destination of the output files generated from the scripts
    
    
**root_folder_intermediate**: Folder name used for the intermediate representations (Make sure it's compatible with the next paremeter)

    
**video_level_folder**: Folder that contains the video level embeddings generated from the video files

    
**video_signatures_folder**:Folder that contains the video  signatures generated from the video files


**match_distance**: Distance threshold that determines whether two videos are a match [FLOAT - 0.0 to 1.0]
    
**video_list_filename**: Name of the file that contains the list of processed video files (to be save by the extraction script)
    
    
### Running 

Within the docker command line

Extract video signatures

`python extract_features.py`

Generate matches

`python generate_matches.py`

Generate network visualization

`python networ_vis.py`


Project Organization
------------

    ├── LICENSE
    ├── Makefile           <- Makefile with commands like `make data` or `make train`
    ├── README.md          <- The top-level README for developers using this project.
    ├── data
    │   ├── external       <- Data from third party sources.
    │   ├── interim        <- Intermediate data that has been transformed.
    │   ├── processed      <- The final, canonical data sets for modeling.
    │   └── raw            <- The original, immutable data dump.
    │
    ├── docs               <- A default Sphinx project; see sphinx-doc.org for details
    │
    ├── models             <- Trained and serialized models, model predictions, or model summaries
    │
    ├── notebooks          <- Notebooks containing API Demonstration / Validation on different datasets.
    │
    ├── references         <- Data dictionaries, manuals, and all other explanatory materials.
    │
    ├── reports            <- Generated analysis as HTML, PDF, LaTeX, etc.
    │   └── figures        <- Generated graphics and figures to be used in reporting
    │
    ├── requirements.txt   <- The requirements file for reproducing the analysis environment, e.g.
    │                         generated with `pip freeze > requirements.txt`
    │
    ├── setup.py           <- makes project pip installable (pip install -e .) so src can be imported
    ├── src                <- Source code for use in this project.
    │   ├── __init__.py    <- Makes src a Python module
    │   │
    │   ├── data           <- Scripts to download or generate data
    │   │   └── make_dataset.py
    │   │
    │   ├── features       <- Scripts to turn raw data into features for modeling
    │   │   └── build_features.py
    │   │
    │   ├── models         <- Scripts to train models and then use trained models to make
    │   │   │                 predictions
    │   │   ├── predict_model.py
    │   │   └── train_model.py
    │   │
    │   └── visualization  <- Scripts to create exploratory and results oriented visualizations
    │       └── visualize.py
    │
    └── tox.ini            <- tox file with settings for running tox; see tox.testrun.org


--------

<p><small>Project based on the <a target="_blank" href="https://drivendata.github.io/cookiecutter-data-science/">cookiecutter data science project template</a>. #cookiecutterdatascience</small></p>
