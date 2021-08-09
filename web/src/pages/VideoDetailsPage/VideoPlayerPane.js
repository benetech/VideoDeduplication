import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import { FileType } from "../../prop-types/FileType";
import VideoPlayer from "./VideoPlayer";
import SceneSelector from "./SceneSelector";
import { seekTo } from "./seekTo";
import { useIntl } from "react-intl";
import CollapseButton from "../../components/basic/CollapseButton";
import Collapse from "@material-ui/core/Collapse";
import LoadableObjectTimeLine from "./LoadableObjectTimeLine";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  header: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  title: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    flexGrow: 1,
  },
  collapseButton: {
    flexGrow: 0,
  },
  playerArea: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  player: {
    height: 300,
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
  const {
    file,
    onPlayerReady,
    collapsible = false,
    onSearchFrame,
    className,
  } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [player, setPlayer] = useState(null);
  const [progress, setProgress] = useState({ played: 0 });
  const [collapsed, setCollapsed] = useState(false);

  const handleJump = useCallback(seekTo(player, file), [player, file]);
  const handleCollapse = useCallback(
    () => setCollapsed(!collapsed),
    [collapsed]
  );

  return (
    <Paper
      className={clsx(classes.root, className)}
      role="region"
      aria-label={messages.ariaLabel}
    >
      <div className={classes.header}>
        <div className={classes.title}>{messages.video}</div>
        {collapsible && (
          <CollapseButton
            collapsed={collapsed}
            onClick={handleCollapse}
            size="small"
          />
        )}
      </div>
      <Collapse in={!collapsed}>
        <div className={classes.playerArea}>
          <VideoPlayer
            file={file}
            className={classes.player}
            onReady={callEach(setPlayer, onPlayerReady)}
            onProgress={setProgress}
            onSearchFrame={onSearchFrame}
            suppressErrors
          />
          <LoadableObjectTimeLine
            file={file}
            className={classes.objects}
            onJump={handleJump}
          />
        </div>
      </Collapse>
      <div className={classes.divider} />
      <SceneSelector
        scenes={file.scenes}
        onSelect={handleJump}
        className={classes.scenes}
        played={progress.played * file.metadata.length}
        collapsible={collapsible}
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
  /**
   * Enable or disable pane collapse feature.
   */
  collapsible: PropTypes.bool,
  /**
   * Handle search for current frame.
   *
   * Callback will receive event containing file and desired time (in seconds).
   * e.g. {
   *   file: {id: 1, ...},
   *   time:
   * }
   */
  onSearchFrame: PropTypes.func,
  className: PropTypes.string,
};

export default VideoPlayerPane;
