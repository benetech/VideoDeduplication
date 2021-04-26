import React, { useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
  TemplateExampleType,
  TemplateType,
} from "../../../prop-types/TemplateType";
import { Dialog } from "@material-ui/core";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

function galleryItems(template) {
  return template.examples.map((example) => ({
    original: example.url,
    thumbnail: example.url,
  }));
}

function TemplateGalleryDialog(props) {
  const { template, startExample, open, onClose, className, ...other } = props;
  const items = useMemo(() => galleryItems(template), [template.examples]);
  const startIndex = template.examples.indexOf(startExample);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={clsx(className)}
      {...other}
    >
      <ImageGallery
        items={items}
        startIndex={startIndex}
        showPlayButton={false}
      />
    </Dialog>
  );
}

TemplateGalleryDialog.propTypes = {
  /**
   * Template which examples will be displayed.
   */
  template: TemplateType.isRequired,
  /**
   * Control dialog visibility.
   */
  open: PropTypes.bool.isRequired,
  /**
   * Handle dialog close.
   */
  onClose: PropTypes.func.isRequired,
  /**
   * Template example which will be displayed first.
   */
  startExample: TemplateExampleType,
  className: PropTypes.string,
};

export default TemplateGalleryDialog;
