import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { VideoFile } from "../../../model/VideoFile";
import VideoPlayerPane from "../../VideoDetailsPage/VideoPlayerPane";
import { seekToObject } from "../../VideoDetailsPage/seekTo";
import FileDescriptionPane from "./FileDescriptionPane";
import { VideoPlayerAPI } from "../../../components/files/VideoPlayer/VideoPlayerAPI";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    // display: "block",
  },
  pane: {
    margin: theme.spacing(2),
  },
}));

function FileDetails(props: FileDetailsProps): JSX.Element {
  const { file, className } = props;
  const classes = useStyles();
  const [player, setPlayer] = useState<VideoPlayerAPI | null>(null);
  const handleJump = useCallback(seekToObject(player, file), [player, file]);
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

type FileDetailsProps = {
  /**
   * Video file to be displayed
   */
  file: VideoFile;
  className?: string;
};
export default FileDetails;
