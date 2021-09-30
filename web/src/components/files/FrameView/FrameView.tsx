import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import VideoPlayer from "../VideoPlayer";
import FileSummary from "../FileSummary";
import Button from "../../basic/Button";
import { useIntl } from "react-intl";
import TimeAttr from "../../basic/TimeAttr/TimeAttr";
import { VideoFile } from "../../../model/VideoFile";
import { useShowFile } from "../../../routing/hooks";
import { VideoPlayerAPI } from "../VideoPlayer/VideoPlayerAPI";

const useStyles = makeStyles<Theme>((theme) => ({
  summary: {
    margin: theme.spacing(2),
  },
  player: {
    height: 300,
  },
  actions: {
    display: "flex",
    flexShrink: 0,
  },
  button: {
    flexShrink: 0,
    marginLeft: theme.spacing(1),
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    frameTime: intl.formatMessage({
      id: "task.attr.frameTime",
    }),
    gotoFile: intl.formatMessage({
      id: "actions.gotoFile",
    }),
    gotoFrame: intl.formatMessage({
      id: "actions.gotoFrame",
    }),
  };
}

function FrameView(props: FrameViewProps): JSX.Element | null {
  const { file, timeMillis, className, ...other } = props;
  const classes = useStyles();
  const [player, setPlayer] = useState<VideoPlayerAPI | null>(null);
  const messages = useMessages();
  const handleShowFrame = useCallback(() => {
    player?.seekTo(timeMillis / 1000, {
      playing: true,
      units: "seconds",
    });
  }, [player, timeMillis]);
  const showFile = useShowFile();
  const handleShowFile = useCallback(() => showFile(file), [file]);

  if (!file) {
    return null;
  }

  return (
    <div className={clsx(className)} {...other}>
      <FileSummary file={file} className={classes.summary}>
        <FileSummary.Name />
        <TimeAttr time={timeMillis} title={messages.frameTime} />
        <div className={classes.actions}>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={handleShowFrame}
            disabled={!player}
          >
            {messages.gotoFrame}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={handleShowFile}
            disabled={!file}
          >
            {messages.gotoFile}
          </Button>
        </div>
      </FileSummary>
      <VideoPlayer
        file={file}
        seekTo={(timeMillis + 1) / ((file.metadata?.length || 0) + 1)}
        className={classes.player}
        onReady={setPlayer}
      />
    </div>
  );
}

type FrameViewProps = {
  /**
   * File which frame will be displayed.
   */
  file: VideoFile;

  /**
   * Frame time position in video, in milli-seconds.
   */
  timeMillis: number;
  className?: string;
};
export default FrameView;
