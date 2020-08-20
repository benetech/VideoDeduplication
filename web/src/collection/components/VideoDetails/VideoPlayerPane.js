import React from "react";
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

function VideoPlayerPane(props) {
  const { file, className } = props;
  const classes = useStyles();
  return (
    <Paper className={clsx(classes.root, className)}>
      <div className={classes.title}>Video</div>
      <VideoPlayer file={file} className={classes.player} />
      <ObjectTimeLine
        file={file}
        className={classes.objects}
        onJump={console.log}
      />
      <div className={classes.divider} />
      <SceneSelector
        scenes={file.scenes}
        onSelect={console.log}
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
