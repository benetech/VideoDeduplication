import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../../prop-types/FileType";
import VideoPlayerPane from "../../VideoDetailsPage/VideoPlayerPane";
import { seekTo } from "../../VideoDetailsPage/seekTo";
import FileDescriptionPane from "./FileDescriptionPane";

const useStyles = makeStyles((theme) => ({
  root: {
    // display: "block",
  },
  pane: {
    margin: theme.spacing(2),
  },
}));

function FileDetails(props) {
  const { file, className } = props;
  const classes = useStyles();
  const [player, setPlayer] = useState(null);

  const handleJump = useCallback(seekTo(player, file), [player, file]);

  return (
    <div
      className={clsx(classes.root, className)}
      data-selector="FileDetails"
      data-file-id={file?.id}
    >
      <VideoPlayerPane
        collapsible
        file={file}
        onPlayerReady={setPlayer}
        className={classes.pane}
      />
      <FileDescriptionPane
        collapsible
        file={file}
        onJump={handleJump}
        className={classes.pane}
      />
    </div>
  );
}

FileDetails.propTypes = {
  /**
   * Video file to be displayed
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default FileDetails;
