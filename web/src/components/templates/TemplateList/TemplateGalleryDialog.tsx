import React, { useMemo } from "react";
import clsx from "clsx";
import { Template, TemplateExample } from "../../../model/Template";
import { Dialog } from "@material-ui/core";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

function galleryItems(template: Template) {
  return template.examples.map((example) => ({
    original: example.url,
    thumbnail: example.url,
  }));
}

function TemplateGalleryDialog(props: TemplateGalleryDialogProps): JSX.Element {
  const { template, startExample, open, onClose, className, ...other } = props;
  const items = useMemo(() => galleryItems(template), [template.examples]);
  const startIndex =
    startExample != null ? template.examples.indexOf(startExample) : 0;
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

type TemplateGalleryDialogProps = {
  /**
   * Template which examples will be displayed.
   */
  template: Template;
  /**
   * Control dialog visibility.
   */
  open: boolean;
  /**
   * Handle dialog close.
   */
  onClose: () => void;
  /**
   * Template example which will be displayed first.
   */
  startExample?: TemplateExample | null;
  className?: string;
};
export default TemplateGalleryDialog;
