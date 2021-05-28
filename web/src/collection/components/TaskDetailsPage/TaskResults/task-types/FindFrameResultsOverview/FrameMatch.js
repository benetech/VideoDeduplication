import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FrameMatchType from "./FrameMatchType";
import TimeCaption from "../../../../VideoDetailsPage/TimeCaption";
import MediaPreview from "../../../../../../common/components/MediaPreview";
import thumbnailURL from "../../../../../../application/files/helpers/thumbnailURL";
import useFile from "../../../../../hooks/useFile";
import FileSummary from "../../../../FileSummary";
import { CircularProgress } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
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
  },
  summary: {
    marginLeft: theme.spacing(2),
    minWidth: 0,
  },
}));

function FrameMatch(props) {
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
        className={clsx(classes.frame)}
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

FrameMatch.propTypes = {
  /**
   * Frame match that will be displayed.
   */
  match: FrameMatchType.isRequired,
  /**
   * Force blur state.
   */
  blur: PropTypes.bool,
  /**
   * Handle frame selection.
   */
  onSelect: PropTypes.func,
  className: PropTypes.string,
};

export default FrameMatch;
