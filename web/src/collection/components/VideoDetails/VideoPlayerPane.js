import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import { FingerprintType } from "../Fingerprints/type";
import VideoPlayer from "./VideoPlayer";
import SceneSelector from "./SceneSelector";
import ObjectTimeLine from "./ObjectTimeLine";
import { seekTo } from "./seekTo";

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

function VideoPlayerPane(props) {
  const { file, onPlayerReady, className } = props;
  const classes = useStyles();
  const [player, setPlayer] = useState(null);
  const [progress, setProgress] = useState({ played: 0 });

  const handleJump = useCallback(seekTo(player, file), [player, file]);

  return (
    <Paper className={clsx(classes.root, className)}>
      <div className={classes.title}>Video</div>
      <VideoPlayer
        file={file}
        className={classes.player}
        onReady={callEach(setPlayer, onPlayerReady)}
        onProgress={setProgress}
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
  file: FingerprintType.isRequired,
  /**
   * Return video-player controller
   */
  onPlayerReady: PropTypes.func,
  className: PropTypes.string,
};

export default VideoPlayerPane;
