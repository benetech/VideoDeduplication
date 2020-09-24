import os

from winnow.config import Config
from winnow.config.path import resolve_config_path
from winnow.feature_extraction import default_model_path
from winnow.feature_extraction.extraction_routine import load_featurizer
from winnow.search_engine.template_matching import SearchEngine
from winnow.storage.repr_storage import ReprStorage

config = Config.read(resolve_config_path())


TEMPLATE_TEST_OUTPUT = os.path.join(config.repr.directory, 'template_test.csv')
DISTANCE = 0.07


print('Loading model...')
model_path = default_model_path(config.proc.pretrained_model_local_path)
model = load_featurizer(model_path)

print(f'Initiating search engine using templates from: '
      f'{config.templates.source_path} and looking at '
      f'videos located in: {config.repr.directory}')

reprs = ReprStorage(config.repr.directory)
se = SearchEngine(templates_root=config.templates.source_path,
                  reprs=reprs, model=model)


print('Running all potential queries and returning results that yield a distance lower than {}'.format(DISTANCE))

se.create_annotation_report(threshold=DISTANCE,fp = TEMPLATE_TEST_OUTPUT)

print('Report saved to {}'.format(TEMPLATE_TEST_OUTPUT))

