import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { CircularProgress, Theme } from "@material-ui/core";
import { ProcessedFileDescr } from "./model";
import TimeCaption from "../../../../../pages/VideoDetailsPage/TimeCaption";
import MediaPreview from "../../../../basic/MediaPreview";
import thumbnailURL from "../../../../../application/api/files/helpers/thumbnailURL";
import useFile from "../../../../../application/api/files/useFile";
import FileSummary from "../../../../files/FileSummary";
import { VideoFile } from "../../../../../model/VideoFile";

const useStyles = makeStyles<Theme>((theme) => ({
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

function ProcessedFile(props: ProcessedFileProps): JSX.Element {
  const {
    file: processedFile,
    blur = true,
    onSelect,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const { file } = useFile(processedFile.id);
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
        caption={<TimeCaption time={file.metadata?.length || 0} />}
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

type ProcessedFileProps = JSX.IntrinsicAttributes & {
  /**
   * Processed online file will be displayed.
   */
  file: ProcessedFileDescr;

  /**
   * Force blur state.
   */
  blur?: boolean;

  /**
   * Handle file selection.
   */
  onSelect?: (file: VideoFile) => void;
  className?: string;
};
export default ProcessedFile;
