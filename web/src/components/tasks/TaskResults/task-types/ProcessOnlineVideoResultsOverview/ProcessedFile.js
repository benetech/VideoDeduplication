import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ProcessedFileType from "./ProcessedFileType";
import TimeCaption from "../../../../../pages/VideoDetailsPage/TimeCaption";
import MediaPreview from "../../../../basic/MediaPreview";
import thumbnailURL from "../../../../../application/state/files/helpers/thumbnailURL";
import useFile from "../../../../../application/api/files/useFile";
import FileSummary from "../../../../files/FileSummary";
import { CircularProgress } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  file: {
    display: "flex",
    alignItems: "center",
    borderWidth: 3,
    borderRadius: theme.spacing(1),
    borderColor: theme.palette.border.light,
    borderStyle: "solid",
    padding: theme.spacing(1),
    minHeight: 100 + theme.spacing(1),
    cursor: "pointer",
  },
  thumbnail: {
    width: 180,
    height: 100,
    flexShrink: 0,
    margin: theme.spacing(0.5),
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "rgba(0,0,0,0)",
    borderRadius: theme.spacing(0.5),
    cursor: "pointer",
  },
  summary: {
    marginLeft: theme.spacing(2),
    minWidth: 0,
  },
}));

function ProcessedFile(props) {
  const { file: fileProp, blur = true, onSelect, className, ...other } = props;
  const classes = useStyles();
  const { file } = useFile(fileProp.id);

  const handleSelect = useCallback(() => {
    if (onSelect && file) {
      onSelect(file);
    }
  }, [file, onSelect]);

  /**
   * Handle selection on keyboard actions
   */
  const handleKeyDown = useCallback(
    (event) => {
      const key = event.key;
      if (key === " " || key === "Enter") {
        handleSelect();
      }
    },
    [handleSelect]
  );

  if (file == null) {
    return (
      <div className={clsx(classes.match, className)} {...other}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div
      className={clsx(classes.file, className)}
      onClick={handleSelect}
      {...other}
    >
      <MediaPreview
        className={classes.thumbnail}
        src={thumbnailURL(file.id, 1)}
        alt="Online Video"
        caption={<TimeCaption time={file.metadata.length} />}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        blur={blur}
        tabIndex={0}
      />
      <FileSummary file={file} className={classes.summary}>
        <FileSummary.Name icon={null} />
      </FileSummary>
    </div>
  );
}

ProcessedFile.propTypes = {
  /**
   * Processed online file will be displayed.
   */
  file: ProcessedFileType.isRequired,
  /**
   * Force blur state.
   */
  blur: PropTypes.bool,
  /**
   * Handle file selection.
   */
  onSelect: PropTypes.func,
  className: PropTypes.string,
};

export default ProcessedFile;
