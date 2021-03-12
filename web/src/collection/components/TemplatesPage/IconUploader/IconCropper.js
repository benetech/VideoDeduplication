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

  const handleCropChange = useCallback(
    (_, percentCrop) => setCrop(percentCrop),
    []
  );

  const handleCrop = useCallback(async () => {
    const croppedDataURL = await cropImageURL({ imageURL, ...crop });
    onCropped(croppedDataURL);
  }, [crop, imageURL]);

  return (
    <div className={clsx(classes.root, className)}>
      <ReactCrop src={imageURL} crop={crop} onChange={handleCropChange} />
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
