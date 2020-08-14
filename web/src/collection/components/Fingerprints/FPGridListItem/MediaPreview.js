import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import IconButton from "@material-ui/core/IconButton";
import VisibilityOffOutlinedIcon from "@material-ui/icons/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";

const useStyles = makeStyles((theme) => ({
  previewContainer: {
    transform: "translate(0%, 0px)",
    overflow: "hidden",
  },
  hide: {
    filter: "blur(10px)",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  previewBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  previewBackdropShow: {
    padding: theme.spacing(2),
  },
  previewBackdropHide: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,5,5,0.4)",
  },
  togglePreview: {
    color: theme.palette.common.white,
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.2)",
    },
  },
  togglePreviewShow: {
    backgroundColor: "rgba(5,5,5,0.4)",
  },
}));

function MediaPreview(props) {
  const { src, alt, className } = props;
  const [preview, setPreview] = useState(false);
  const classes = useStyles();

  const togglePreview = useCallback(() => setPreview(!preview), [preview]);

  // Define preview icon
  let previewIcon;
  if (preview) {
    previewIcon = <VisibilityOffOutlinedIcon fontSize="small" />;
  } else {
    previewIcon = <VisibilityOutlinedIcon />;
  }

  return (
    <div className={clsx(classes.previewContainer, className)}>
      <img
        alt={alt}
        src={src}
        className={clsx(classes.image, { [classes.hide]: !preview })}
      />
      <div
        className={clsx(classes.previewBackdrop, {
          [classes.previewBackdropHide]: !preview,
          [classes.previewBackdropShow]: preview,
        })}
      >
        <IconButton
          className={clsx(
            classes.togglePreview,
            preview && classes.togglePreviewShow
          )}
          size={preview ? "small" : "medium"}
          onClick={togglePreview}
        >
          {previewIcon}
        </IconButton>
      </div>
    </div>
  );
}

MediaPreview.propTypes = {
  alt: PropTypes.string,
  src: PropTypes.string,
  className: PropTypes.string,
};

export default MediaPreview;
