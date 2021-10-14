import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import IconDropZone from "./IconDropZone";
import IconCropper from "./IconCropper";

const useStyles = makeStyles<Theme>({
  root: {},
  dropZone: {
    width: "100%",
    height: "100%",
  },
  cropper: {
    width: "100%",
    height: "100%",
  },
});

function IconUploader(props: IconUploaderProps): JSX.Element {
  const { onUpload, className } = props;
  const classes = useStyles();
  const [file, setFile] = useState<File | null>(null);
  const handleCrop = useCallback(
    (url) => {
      setFile(null);
      onUpload(url);
    },
    [onUpload]
  );
  const handleCancel = useCallback(() => setFile(null), []);
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

type IconUploaderProps = {
  /**
   * Handle uploaded icon URL.
   */
  onUpload: (...args: any[]) => void;
  className?: string;
};
export default IconUploader;
