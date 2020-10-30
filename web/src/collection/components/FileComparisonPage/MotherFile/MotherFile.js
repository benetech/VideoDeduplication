import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import useFile from "../../../hooks/useFile";
import LoadingHeader from "../LoadingHeader";
import FileDetails from "../FileDetails";
import FileDetailsHeader from "./FileDetailsHeader";

const useStyles = makeStyles((theme) => ({
  root: {},
  header: {
    height: theme.spacing(10),
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  title: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    flexGrow: 1,
  },
  loading: {
    margin: theme.spacing(2),
  },
  fileHeader: {
    marginTop: 0,
    margin: theme.spacing(2),
  },
}));

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "file.mother" }),
    loadError: intl.formatMessage({ id: "file.load.error.single" }),
  };
}

function MotherFile(props) {
  const { motherFileId, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { file, error, loadFile } = useFile(motherFileId);

  let content;
  if (file == null) {
    content = (
      <LoadingHeader
        onRetry={loadFile}
        errorMessage={messages.loadError}
        error={error}
        className={classes.loading}
      />
    );
  } else {
    content = (
      <div>
        <FileDetailsHeader file={file} className={classes.fileHeader} />
        <FileDetails file={file} />
      </div>
    );
  }

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{messages.title}</div>
      </div>
      {content}
    </div>
  );
}

MotherFile.propTypes = {
  /**
   * Mother file id.
   */
  motherFileId: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default MotherFile;
