import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import VisibilityOffOutlinedIcon from "@material-ui/icons/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";
import PreviewActions from "./PreviewActions";
import PreviewCaption from "./PreviewCaption";
import { useIntl } from "react-intl";
import NotAvailable from "./NotAvailable";
import Action from "../../../model/Action";

const useStyles = makeStyles<Theme>((theme) => ({
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
  fallback: {
    width: "100%",
    height: "100%",
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

function MediaPreview(props: MediaPreviewProps): JSX.Element {
  const {
    src,
    alt,
    actions,
    caption,
    onMediaClick,
    blur = true,
    className,
    ...other
  } = props;
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState(false);
  const classes = useStyles();
  const intl = useIntl();
  const togglePreview = useCallback(
    (event) => {
      event.stopPropagation();
      setPreview(!preview);
    },
    [preview]
  );
  /**
   * Force blur enable/disable when external attributes is changed.
   */

  useEffect(() => {
    setPreview(!blur);
  }, [blur]);
  /**
   * Do not allow Enter or Space key-press events to bubble
   * because it may trigger unwanted actions in parent elements.
   */

  const handleKeyDown = useCallback((event) => {
    const key = event.key;

    if (key === " " || key === "Enter") {
      event.stopPropagation();
    }
  }, []);
  /**
   * Handle image loading error.
   */

  const handleError = useCallback(() => setError(true), []); // Define preview icon

  let previewIcon;

  if (preview) {
    previewIcon = <VisibilityOffOutlinedIcon fontSize="small" />;
  } else {
    previewIcon = <VisibilityOutlinedIcon />;
  } // Define preview image

  let image;

  if (error) {
    image = (
      <NotAvailable
        className={clsx(classes.fallback, {
          [classes.hide]: !preview,
        })}
      />
    );
  } else {
    image = (
      <img
        alt={alt}
        src={src}
        onError={handleError}
        className={clsx(classes.image, {
          [classes.hide]: !preview,
        })}
      />
    );
  }

  return (
    <div className={clsx(classes.previewContainer, className)} {...other}>
      {image}
      <div
        className={clsx(classes.previewBackdrop, {
          [classes.previewBackdropHide]: !preview,
          [classes.previewBackdropShow]: preview,
          [classes.clickable]: onMediaClick != null && preview,
        })}
        onClick={preview ? onMediaClick : undefined}
        onKeyDown={handleKeyDown}
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

type MediaPreviewProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * Optional action buttons.
   */
  actions?: Action[];

  /**
   * Caption elements at the left-bottom corner
   */
  caption?: React.ReactNode;

  /**
   * Handle revealed preview click
   */
  onMediaClick?: (...args: any[]) => void;

  /**
   * Force blur enable/disable.
   */
  blur?: boolean;
  alt?: string;
  src?: string;
  className?: string;
};
export default MediaPreview;
