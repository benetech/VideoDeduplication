import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import { FileType } from "../FileBrowserPage/FileType";
import VideoPlayer from "./VideoPlayer";
import SceneSelector from "./SceneSelector";
import ObjectTimeLine from "./ObjectTimeLine";
import { seekTo } from "./seekTo";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  title: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    padding: theme.spacing(2),
  },
  player: {
    height: 300,
    margin: theme.spacing(2),
  },
  objects: {
    margin: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  divider: {
    width: "100%",
    borderTop: `1px solid ${theme.palette.dividerLight}`,
  },
  scenes: {
    margin: theme.spacing(2),
  },
}));

function callEach(...actions) {
  actions = actions.filter(Boolean);
  return (value) => actions.forEach((action) => action(value));
}

function useMessages() {
  const intl = useIntl();
  return {
    video: intl.formatMessage({ id: "file.title" }),
    ariaLabel: intl.formatMessage({ id: "aria.label.videoPlayerRegion" }),
  };
}

function VideoPlayerPane(props) {
  const { file, onPlayerReady, className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [player, setPlayer] = useState(null);
  const [progress, setProgress] = useState({ played: 0 });

  const handleJump = useCallback(seekTo(player, file), [player, file]);

  return (
    <Paper
      className={clsx(classes.root, className)}
      role="region"
      aria-label={messages.ariaLabel}
    >
      <div className={classes.title}>{messages.video}</div>
      <VideoPlayer
        file={file}
        className={classes.player}
        onReady={callEach(setPlayer, onPlayerReady)}
        onProgress={setProgress}
        suppressErrors
      />
      <ObjectTimeLine
        file={file}
        className={classes.objects}
        onJump={handleJump}
      />
      <div className={classes.divider} />
      <SceneSelector
        scenes={file.scenes}
        onSelect={handleJump}
        className={classes.scenes}
        played={progress.played * file.metadata.length}
      />
    </Paper>
  );
}

VideoPlayerPane.propTypes = {
  /**
   * Video file
   */
  file: FileType.isRequired,
  /**
   * Return video-player controller
   */
  onPlayerReady: PropTypes.func,
  className: PropTypes.string,
};

export default VideoPlayerPane;
