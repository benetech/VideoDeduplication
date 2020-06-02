import os
os.environ['WINNOW_CONFIG'] = os.path.abspath('../config.yaml')
import numpy as np
import matplotlib.pyplot as plt
from scipy.spatial.distance import cdist
from glob import glob
from winnow.feature_extraction.extraction_routine import load_featurizer
from winnow.feature_extraction.utils import load_image,load_video,download_file
from winnow.search_engine.template_matching import SearchEngine,download_sample_templates
from winnow.annotation.tools import Annotator
import requests
import shutil
import yaml

with open("config.yaml", 'r') as ymlfile:
    cfg = yaml.load(ymlfile)


TEMPLATES_SOURCE = cfg['templates_source_path']
SEARCH_SPACE = os.path.join(cfg['destination_folder'],cfg['root_folder_intermediate'],'frame_level')
TEMPLATE_TEST_OUTPUT = os.path.join(cfg['destination_folder'],'template_test.csv')
DISTANCE = 0.07

print('Loading model...')
model = load_featurizer()

print('Initiating search engine using templates from:{} and loooking at videos located in:{}'.format(TEMPLATES_SOURCE,
                  SEARCH_SPACE))

se = SearchEngine(TEMPLATES_SOURCE,
                  SEARCH_SPACE,
                  model)


print('Running all potential queries and returning results that yield a distance lower than {}'.format(DISTANCE))

se.create_annotation_report(threshold=DISTANCE,fp = TEMPLATE_TEST_OUTPUT)

print('Report saved to {}'.format(TEMPLATE_TEST_OUTPUT))

