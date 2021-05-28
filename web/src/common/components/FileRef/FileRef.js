import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import useFile from "../../../collection/hooks/useFile";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    fileId: intl.formatMessage({ id: "file.id" }),
  };
}

function FileRef(props) {
  const { fileId, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { file } = useFile(fileId);

  if (!file) {
    return (
      <span className={clsx(className)} {...other}>
        {fileId} ({messages.fileId})
      </span>
    );
  }

  return (
    <span className={clsx(className)} {...other}>
      {file.filename}
    </span>
  );
}

FileRef.propTypes = {
  /**
   * File Id.
   */
  fileId: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default FileRef;
