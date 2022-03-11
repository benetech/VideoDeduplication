import logging
import os
import pickle
import tempfile
from pathlib import Path
from typing import List, Collection

import numpy as np
from sqlalchemy.orm import eagerload

from db import Database
from db.schema import TemplateExample as DBTemplateExample, Template as DBTemplate
from template_support.file_storage import FileStorage, LocalFileStorage
from thumbnail.ffmpeg import extract_frame
from winnow.config import TemplatesConfig
from winnow.feature_extraction.model_tf import CNN_tf
from winnow.feature_extraction.utils import load_image
from winnow.search_engine.model import Template, TemplateExample, Frame

_logger = logging.getLogger(__name__)


class TemplateLoader:
    def __init__(
        self,
        pretrained_model: CNN_tf,
        extensions: Collection[str] = TemplatesConfig.extensions,
        image_size: int = 224,
    ):
        """Create template loader."""
        self._image_size = image_size
        self._pretrained_model = pretrained_model
        self._extensions = extensions

    def load_template_from_folder(self, path: str, extensions: Collection[str] = None) -> Template:
        """Load single template from folder.

        Template name is equal to the folder name. Template examples are
        images with the given extensions located at the template folder root.
        """
        if not os.path.isdir(path):
            raise ValueError(f"Not a directory: {path}")
        extensions = extensions or self._extensions
        template_name = os.path.basename(path)
        image_paths = self._image_paths(path, extensions)
        resized_images = np.array([load_image(image, self._image_size) for image in image_paths])
        features = self._pretrained_model.extract(resized_images, batch_sz=10)

        examples = []
        file_storage = LocalFileStorage(directory=path)
        for image_path, image_features in zip(image_paths, features):
            example = TemplateExample(
                storage_key=os.path.relpath(image_path, path),
                features=image_features,
                file_storage=file_storage,
            )
            examples.append(example)

        return Template(name=template_name, features=features, examples=examples)

    def load_templates_from_folder(self, path: str, extensions: List[str] = None) -> List[Template]:
        """Load templates from the local folder.

        The folder should contain top-level sub-folders with images.
        Each top-level sub-folder is interpreted as a template.
        Template name is equal to the corresponding sub-folder name.
        Template examples are images found at the corresponding sub-folders root.
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
            for db_template in session.query(DBTemplate).options(eagerload(DBTemplate.examples)).all():
                template = self._load_db_template(db_template, file_storage)
                templates.append(template)
        return templates

    def store_templates(self, templates: List[Template], database: Database, file_storage: FileStorage):
        """Populate database with the given templates."""
        return [self.store_template(template, database, file_storage) for template in templates]

    def store_template(self, template: Template, database: Database, file_storage: FileStorage) -> Template:
        """Write template to the database."""
        stored_example_keys = []
        try:
            with database.session_scope(expunge=True) as session:
                # Get or create database template entity by name
                db_template = session.query(DBTemplate).filter(DBTemplate.name == template.name).one_or_none()
                if db_template is None:
                    db_template = DBTemplate(name=template.name)
                    session.add(db_template)

                # Delete old examples
                deleted_example_keys = [example.storage_key for example in db_template.examples]
                old_examples = session.query(DBTemplateExample)
                old_examples = old_examples.filter(DBTemplateExample.template.has(DBTemplate.name == template.name))
                old_examples.delete(synchronize_session="fetch")

                # Create new examples from the given template
                new_examples = []
                with tempfile.TemporaryDirectory(prefix=f"template-{template.name}-") as tempdir:
                    for example in template.examples:

                        # Store example image
                        destination = os.path.join(tempdir, example.storage_key)
                        if not example.get_file(destination):
                            _logger.warning(
                                "Cannot get read example '%s' for template '%s'",
                                example.storage_key,
                                template.name,
                            )
                            continue
                        storage_key = file_storage.save_file(destination)
                        stored_example_keys.append(storage_key)

                        # Dump example features
                        features = example.features
                        if features is not None:
                            features = pickle.dumps(features)

                        # Create new DB example
                        db_example = DBTemplateExample(
                            template=db_template,
                            features=features,
                            storage_key=storage_key,
                        )
                        session.add(db_example)
                        new_examples.append(db_example)
                db_template.examples = new_examples

            # Delete file storage entries for old examples
            for deleted_example_key in deleted_example_keys:
                file_storage.delete(deleted_example_key)

            # Create a new template model representing database template
            result_examples = []
            for db_example in db_template.examples:
                features = pickle.loads(db_example.features) if db_example.features else None
                example = TemplateExample(
                    storage_key=db_example.storage_key,
                    features=features,
                    file_storage=file_storage,
                )
                result_examples.append(example)
            features = np.array([example.features for example in result_examples])
            return Template(name=template.name, features=features, examples=result_examples)

        except Exception:
            _logger.exception("Cannot create template %s", template.name)
            for storage_key in stored_example_keys:
                file_storage.delete(storage_key)
            raise

    def load_template_from_frame(self, frame: Frame) -> Template:
        """Create temporary template from video-file frame."""

        with tempfile.TemporaryDirectory(prefix="frame-folder-") as directory:
            frame_path = os.path.join(directory, "frame.jpg")
            extract_frame(source_path=frame.path, destination=frame_path, position=frame.time, width=self._image_size)
            resized_images = np.array([load_image(frame_path, self._image_size)])
            features = self._pretrained_model.extract(resized_images, batch_sz=10)

        name = f"{os.path.basename(frame.path)} at {int(frame.time)} millisec."
        return Template(name=name, features=features, examples=[])

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

        if len(existing_features) > 0:
            result_features = np.concatenate((np.array(existing_features), calculated_features))
        else:
            result_features = calculated_features

        # Create examples model objects
        template_examples = []
        for db_example in db_template.examples:
            template_example = TemplateExample(
                storage_key=db_example.storage_key,
                features=pickle.loads(db_example.features),
                file_storage=file_storage,
            )
            template_examples.append(template_example)

        return Template(
            name=db_template.name,
            features=result_features,
            examples=template_examples,
        )

    def _image_paths(self, template_folder: str, extensions: Collection[str]) -> Collection[str]:
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
