import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import cropImageURL from "./cropImageURL";
import Fab from "@material-ui/core/Fab";
import DoneIcon from "@material-ui/icons/Done";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
  root: {
    transform: "translate(0%, 0px)",
  },
  actions: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: theme.zIndex.modal,
  },
  action: {
    margin: theme.spacing(1),
  },
}));

function maxCrop(image) {
  const width =
    image.width <= image.height ? 100 : 100 * (image.height / image.width);
  const height =
    image.height <= image.width ? 100 : 100 * (image.width / image.height);
  const x =
    image.width <= image.height ? 0 : 50 * (1 - image.height / image.width);
  const y =
    image.height <= image.width ? 0 : 50 * (1 - image.width / image.height);
  return { unit: "%", aspect: 1, width, height, x, y };
}

function IconCropper(props) {
  const { iconFile, onCropped, onCancel, className } = props;
  const [imageURL, setImageURL] = useState(null);
  const [crop, setCrop] = useState({ aspect: 1, unit: "%" });
  const classes = useStyles();

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setImageURL(reader.result);
    reader.readAsDataURL(iconFile);
  }, [iconFile]);

  const handleCropChange = useCallback((_, percentCrop) => {
    console.log(_, percentCrop);
    setCrop(percentCrop);
  }, []);

  const handleCrop = useCallback(async () => {
    const croppedDataURL = await cropImageURL({ imageURL, ...crop });
    onCropped(croppedDataURL);
  }, [crop, imageURL]);

  const handleLoaded = useCallback((image) => {
    setCrop(maxCrop(image));
    return false;
  }, []);

  return (
    <div className={clsx(classes.root, className)}>
      <ReactCrop
        src={imageURL}
        crop={crop}
        onChange={handleCropChange}
        onImageLoaded={handleLoaded}
      />
      <div className={classes.actions}>
        <Fab
          size="small"
          color="primary"
          className={classes.action}
          onClick={handleCrop}
        >
          <DoneIcon />
        </Fab>
        <Fab
          size="small"
          color="secondary"
          className={classes.action}
          onClick={onCancel}
        >
          <CloseIcon />
        </Fab>
      </div>
    </div>
  );
}

IconCropper.propTypes = {
  /**
   * Selected Icon file.
   */
  iconFile: PropTypes.any,
  /**
   * Callback receiving cropped image url on successful crop finish.
   */
  onCropped: PropTypes.func.isRequired,
  /**
   * Handle cancel.
   */
  onCancel: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default IconCropper;
