import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import { useIntl } from "react-intl";
import { useDropzone } from "react-dropzone";

const useStyles = makeStyles((theme) => ({
  dropZoneRoot: {
    border: "4px dashed #D8D8D8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  dragActive: {
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.dividerLight,
  },
  icon: {
    marginTop: -theme.spacing(5),
    margin: theme.spacing(2),
    fontSize: 50,
  },
  title: {
    ...theme.mixins.title2,
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
  },
  subtitle: {
    ...theme.mixins.text,
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    drag: intl.formatMessage({ id: "actions.dnd.drag" }),
    click: intl.formatMessage({ id: "actions.dnd.click" }),
  };
}

function IconDropZone(props) {
  const { onFileSelected, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const acceptFiles = useCallback((files) => onFileSelected(files[0]), []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptFiles,
  });

  const dropZoneClass = clsx(
    classes.dropZoneRoot,
    isDragActive && classes.dragActive,
    className
  );

  return (
    <div className={dropZoneClass} {...getRootProps()} {...other}>
      <input {...getInputProps()} accept="image/*" type="file" />
      <ArrowUpwardIcon className={classes.icon} />
      <div className={classes.title}>{messages.drag}</div>
      <div className={classes.subtitle}>{messages.click}</div>
    </div>
  );
}

IconDropZone.propTypes = {
  onFileSelected: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default IconDropZone;
