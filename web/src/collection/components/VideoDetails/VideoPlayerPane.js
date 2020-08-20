import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import { FingerprintType } from "../Fingerprints/type";
import VideoPlayer from "./VideoPlayer";
import SceneSelector from "./SceneSelector";
import ObjectTimeLine from "./ObjectTimeLine";

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
    borderTop: "1px solid #D8D8D8",
  },
  scenes: {
    margin: theme.spacing(2),
  },
}));

function updatePosition(setter, file) {
  return (object) => setter(object.position / file.metadata.length);
}

function VideoPlayerPane(props) {
  const { file, className } = props;
  const classes = useStyles();
  const [position, setPosition] = useState(null);

  const handleJump = useCallback(updatePosition(setPosition, file), [file]);

  return (
    <Paper className={clsx(classes.root, className)}>
      <div className={classes.title}>Video</div>
      <VideoPlayer file={file} className={classes.player} seekTo={position} />
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
      />
    </Paper>
  );
}

VideoPlayerPane.propTypes = {
  file: FingerprintType.isRequired,
  className: PropTypes.string,
};

export default VideoPlayerPane;
