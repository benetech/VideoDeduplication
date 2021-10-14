import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { CircularProgress, Theme } from "@material-ui/core";
import TimeCaption from "../../../../../pages/VideoDetailsPage/TimeCaption";
import MediaPreview from "../../../../basic/MediaPreview";
import thumbnailURL from "../../../../../application/api/files/helpers/thumbnailURL";
import useFile from "../../../../../application/api/files/useFile";
import FileSummary from "../../../../files/FileSummary";
import { FoundFrame } from "../../../../../model/Task";

const useStyles = makeStyles<Theme>((theme) => ({
  match: {
    display: "flex",
    alignItems: "center",
    borderWidth: 3,
    borderRadius: theme.spacing(1),
    borderColor: theme.palette.border.light,
    borderStyle: "solid",
    padding: theme.spacing(1),
    minHeight: 100 + theme.spacing(1),
  },
  frame: {
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

function FrameMatch(props: FrameMatchProps): JSX.Element {
  const { match, blur = true, onSelect, className, ...other } = props;
  const classes = useStyles();
  const { file } = useFile(match.fileId);
  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(match);
    }
  }, [match, onSelect]);
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
    <div className={clsx(classes.match, className)} {...other}>
      <MediaPreview
        className={classes.frame}
        src={thumbnailURL(match.fileId, match.startMs)}
        alt="frame"
        caption={<TimeCaption time={match.startMs} />}
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

type FrameMatchProps = {
  /**
   * Frame match that will be displayed.
   */
  match: FoundFrame;

  /**
   * Force blur state.
   */
  blur?: boolean;

  /**
   * Handle frame selection.
   */
  onSelect?: (...args: any[]) => void;
  className?: string;
};
export default FrameMatch;
