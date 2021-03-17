import os
import pickle
import tempfile
from pathlib import Path
from typing import List

import numpy as np
from sqlalchemy.orm import eagerload

from db import Database
from db.schema import TemplateExample, Template as DBTemplate
from winnow.config import TemplatesConfig
from winnow.feature_extraction.model_tf import CNN_tf
from winnow.feature_extraction.utils import load_image
from winnow.search_engine.model import Template
from winnow.storage.file_storage import FileStorage


class TemplateLoader:
    def __init__(
        self,
        pretrained_model: CNN_tf,
        extensions: List[str] = TemplatesConfig.extensions,
        image_size: int = 224,
    ):
        """Create template loader."""
        self._image_size = image_size
        self._pretrained_model = pretrained_model
        self._extensions = extensions

    def load_template_from_folder(self, path: str, extensions: List[str] = None) -> Template:
        """Load single template from folder.

        Template name is equal to folder name. Template examples are images
        with the given extensions found at the template folder root.
        """
        if not os.path.isdir(path):
            raise ValueError(f"Not a directory: {path}")
        extensions = extensions or self._extensions
        template_name = os.path.basename(path)
        image_paths = self._image_paths(path, extensions)
        resized_images = np.array([load_image(image, self._image_size) for image in image_paths])
        features = self._pretrained_model.extract(resized_images, batch_sz=10)
        return Template(name=template_name, features=features)

    def load_templates_from_folder(self, path: str, extensions: List[str] = None) -> List[Template]:
        """Load templates from the local folder.

        The folder should contain top-level sub-folders with images.
        Each top-level sub-folder is interpreted as a template.
        Template name is equal to the corresponding sub-folder name.
        Template examples are images found at the corresponding sub-folder root.
        """
        templates = []
        for template_folder in self._child_folders(path):
            template = self.load_template_from_folder(template_folder, extensions)
            templates.append(template)
        return templates

    def load_templates_from_database(self, database: Database, file_storage: FileStorage) -> List[Template]:
        """Load templates from the database."""
        templates = []
        with database.session_scope(expunge=True) as session:
            for db_template in session.query(DBTemplate).options(eagerload(TemplateExample)).all():
                template = self._load_db_template(db_template, file_storage)
                templates.append(template)
        return templates

    def _load_db_template(self, db_template: DBTemplate, file_storage: FileStorage) -> Template:
        """Load template from the database."""
        existing_features = []
        unhandled_examples = []
        for example in db_template.examples:
            if example.features is not None:
                existing_features.append(pickle.loads(example.features))
            else:
                unhandled_examples.append(example)
        with tempfile.TemporaryDirectory(prefix=f"template-{db_template.name}-") as tmp_directory:
            resized_images = []
            for index, example in enumerate(unhandled_examples):
                image_path = os.path.join(tmp_directory, f"example-{index}")
                file_storage.get_file(example.storage_key, image_path)
                resized_images.append(load_image(image_path, self._image_size))
            calculated_features = self._pretrained_model.extract(np.array(resized_images), batch_sz=10)
            for index, features in enumerate(calculated_features):
                example = unhandled_examples[index]
                example.features = pickle.dumps(features)
        features = np.concatenate((np.array(existing_features), calculated_features))
        return Template(name=db_template.name, features=features)

    def _image_paths(self, template_folder: str, extensions: List[str]) -> List[str]:
        """Get paths of images located at the root of the given folder."""
        results = []
        extensions = {f".{ext}" for ext in extensions}
        for entry in os.listdir(template_folder):
            image_path = os.path.join(template_folder, entry)
            if os.path.isfile(image_path) and Path(image_path).suffix in extensions:
                results.append(image_path)
        return results

    def _child_folders(self, path):
        """List top-level child folders."""
        for entry in os.listdir(path):
            child_path = os.path.join(path, entry)
            if os.path.isdir(child_path):
                yield child_path
