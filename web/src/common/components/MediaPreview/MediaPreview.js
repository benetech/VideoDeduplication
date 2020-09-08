import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import IconButton from "@material-ui/core/IconButton";
import VisibilityOffOutlinedIcon from "@material-ui/icons/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";
import PreviewActions from "./PreviewActions";
import PreviewCaption from "./PreviewCaption";
import { useIntl } from "react-intl";

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
  clickable: {
    cursor: "pointer",
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
  actionsShow: {
    display: "flex",
    alignItems: "center",
  },
  actionsHide: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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
  caption: {
    position: "absolute",
    bottom: 0,
    left: 0,
    margin: theme.spacing(1),
  },
}));

/**
 * Blurred media preview.
 */
function MediaPreview(props) {
  const {
    src,
    alt,
    actions,
    caption,
    onMediaClick,
    className,
    ...other
  } = props;

  const [preview, setPreview] = useState(false);
  const classes = useStyles();
  const intl = useIntl();

  const togglePreview = useCallback(
    (event) => {
      event.stopPropagation();
      setPreview(!preview);
    },
    [preview]
  );

  // Define preview icon
  let previewIcon;
  if (preview) {
    previewIcon = <VisibilityOffOutlinedIcon fontSize="small" />;
  } else {
    previewIcon = <VisibilityOutlinedIcon />;
  }

  return (
    <div className={clsx(classes.previewContainer, className)} {...other}>
      <img
        alt={alt}
        src={src}
        className={clsx(classes.image, { [classes.hide]: !preview })}
      />
      <div
        className={clsx(classes.previewBackdrop, {
          [classes.previewBackdropHide]: !preview,
          [classes.previewBackdropShow]: preview,
          [classes.clickable]: onMediaClick != null && preview,
        })}
        onClick={preview ? onMediaClick : undefined}
      >
        <div className={preview ? classes.actionsShow : classes.actionsHide}>
          <IconButton
            className={clsx(
              classes.togglePreview,
              preview && classes.togglePreviewShow
            )}
            size={preview ? "small" : "medium"}
            onClick={togglePreview}
            aria-label={intl.formatMessage({
              id: preview ? "actions.hidePreview" : "actions.showPreview",
            })}
          >
            {previewIcon}
          </IconButton>
          <PreviewActions
            actions={actions}
            size={preview ? "small" : "medium"}
            dark={preview}
          />
        </div>
      </div>
      <PreviewCaption className={classes.caption} backdrop={preview}>
        {caption}
      </PreviewCaption>
    </div>
  );
}

MediaPreview.propTypes = {
  /**
   * Optional action buttons.
   */
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      handler: PropTypes.func.isRequired,
    })
  ),
  /**
   * Caption elements at the left-bottom corner
   */
  caption: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  /**
   * Handle revealed preview click
   */
  onMediaClick: PropTypes.func,
  alt: PropTypes.string,
  src: PropTypes.string,
  className: PropTypes.string,
};

export default MediaPreview;
