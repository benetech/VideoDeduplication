import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileSummary from "../../FileSummary/FileSummary";
import { FileType } from "../../../prop-types/FileType";

const useStyles = makeStyles((theme) => ({
  header: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    padding: theme.spacing(2),
  },
  name: {
    paddingBottom: theme.spacing(2),
  },
}));

function FileDetailsHeader(props) {
  const { file, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.header, className)} {...other}>
      <FileSummary file={file} divider className={classes.name}>
        <FileSummary.Name />
      </FileSummary>
      <FileSummary file={file} divider>
        <FileSummary.Fingerprint />
        <FileSummary.Duration />
        <FileSummary.CreationDate />
      </FileSummary>
    </div>
  );
}

FileDetailsHeader.propTypes = {
  /**
   * Video file to be summarized.
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default FileDetailsHeader;
