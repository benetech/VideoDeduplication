import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import IconDropZone from "./IconDropZone";
import IconCropper from "./IconCropper";

const useStyles = makeStyles((theme) => ({
  root: {},
  dropZone: {
    width: "100%",
    height: "100%",
  },
  cropper: {
    width: "100%",
    height: "100%",
  },
}));

function IconUploader(props) {
  const { onUpload, className } = props;
  const classes = useStyles();
  const [file, setFile] = useState(null);

  const handleCrop = useCallback(
    (url) => {
      setFile(null);
      onUpload(url);
    },
    [onUpload]
  );

  const handleCancel = useCallback(() => setFile(null));

  return (
    <div className={clsx(classes.root, className)}>
      {file == null && (
        <IconDropZone onFileSelected={setFile} className={classes.dropZone} />
      )}
      {file != null && (
        <IconCropper
          iconFile={file}
          onCropped={handleCrop}
          onCancel={handleCancel}
          className={classes.cropper}
        />
      )}
    </div>
  );
}

IconUploader.propTypes = {
  /**
   * Handle uploaded icon URL.
   */
  onUpload: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default IconUploader;
