import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ReactCrop, { PercentCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import cropImageURL from "./cropImageURL";
import Fab from "@material-ui/core/Fab";
import DoneIcon from "@material-ui/icons/Done";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles<Theme>((theme) => ({
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

function maxCrop(image: HTMLImageElement): PercentCrop {
  const width =
    image.width <= image.height ? 100 : 100 * (image.height / image.width);
  const height =
    image.height <= image.width ? 100 : 100 * (image.width / image.height);
  const x =
    image.width <= image.height ? 0 : 50 * (1 - image.height / image.width);
  const y =
    image.height <= image.width ? 0 : 50 * (1 - image.width / image.height);
  return {
    unit: "%",
    aspect: 1,
    width,
    height,
    x,
    y,
  };
}

function IconCropper(props: IconCropperProps): JSX.Element {
  const { iconFile, onCropped, onCancel, className } = props;
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [crop, setCrop] = useState<PercentCrop>({
    aspect: 1,
    unit: "%",
  });
  const classes = useStyles();
  useEffect(() => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImageURL(result);
      }
    };

    reader.readAsDataURL(iconFile);
  }, [iconFile]);
  const handleCropChange = useCallback((_, percentCrop: PercentCrop) => {
    console.log(_, percentCrop);
    setCrop(percentCrop);
  }, []);
  const handleCrop = useCallback(async () => {
    if (typeof imageURL !== "string") {
      return;
    }
    const croppedDataURL = await cropImageURL({
      imageURL,
      ...crop,
      resultHeight: 120,
      resultWidth: 120,
    });
    onCropped(croppedDataURL);
  }, [crop, imageURL]);
  const handleLoaded = useCallback((image: HTMLImageElement) => {
    setCrop(maxCrop(image));
    return false;
  }, []);
  return (
    <div className={clsx(classes.root, className)}>
      {imageURL != null && (
        <ReactCrop
          src={imageURL}
          crop={crop}
          onChange={handleCropChange}
          onImageLoaded={handleLoaded}
        />
      )}
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

type IconCropperProps = {
  /**
   * Selected Icon file.
   */
  iconFile: File;

  /**
   * Callback receiving cropped image url on successful crop finish.
   */
  onCropped: (...args: any[]) => void;

  /**
   * Handle cancel.
   */
  onCancel: () => void;
  className?: string;
};
export default IconCropper;
