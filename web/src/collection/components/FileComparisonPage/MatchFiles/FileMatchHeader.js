import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileSummary from "../../FileSummary/FileSummary";
import { FileType } from "../../FileBrowserPage/FileType";
import Distance from "../../../../common/components/Distance";

const useStyles = makeStyles((theme) => ({
  header: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    padding: theme.spacing(2),
  },
  name: {
    paddingBottom: theme.spacing(2),
  },
  distance: {
    minWidth: 150,
  },
}));

function FileMatchHeader(props) {
  const { distance, file, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.header, className)} {...other}>
      <FileSummary file={file} className={classes.name}>
        <FileSummary.Name />
        <Distance value={distance} dense className={classes.distance} />
      </FileSummary>
      <FileSummary file={file} divider>
        <FileSummary.Fingerprint />
        <FileSummary.Duration />
        <FileSummary.CreationDate />
        <FileSummary.HasExif />
      </FileSummary>
    </div>
  );
}

FileMatchHeader.propTypes = {
  /**
   * Distance to the matched file.
   */
  distance: PropTypes.number.isRequired,
  /**
   * Video file to be summarized.
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default FileMatchHeader;
