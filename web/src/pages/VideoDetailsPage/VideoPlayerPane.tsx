import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { VideoFile } from "../../model/VideoFile";
import VideoPlayer from "../../components/files/VideoPlayer";
import SceneSelector from "./SceneSelector";
import { seekToObject, seekToScene } from "./seekTo";
import { useIntl } from "react-intl";
import CollapseButton from "../../components/basic/CollapseButton";
import Collapse from "@material-ui/core/Collapse";
import LoadableObjectTimeLine from "./LoadableObjectTimeLine";
import { VideoPlayerAPI } from "../../components/files/VideoPlayer/VideoPlayerAPI";

const useStyles = makeStyles<Theme>((theme) => ({
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
  title: { ...theme.mixins.title3, fontWeight: "bold", flexGrow: 1 },
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

type AcceptFn<TValue> = (value: TValue) => void;

function callEach<T>(...actions: AcceptFn<T>[]): AcceptFn<T> {
  actions = actions.filter(Boolean);
  return (value) => actions.forEach((action) => action(value));
}

function useMessages() {
  const intl = useIntl();
  return {
    video: intl.formatMessage({
      id: "file.title",
    }),
    ariaLabel: intl.formatMessage({
      id: "aria.label.videoPlayerRegion",
    }),
  };
}

function VideoPlayerPane(props: VideoPlayerPaneProps): JSX.Element {
  const {
    file,
    onPlayerReady = () => null,
    collapsible = false,
    playerActions,
    className,
  } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [player, setPlayer] = useState<VideoPlayerAPI | null>(null);
  const [progress, setProgress] = useState({
    played: 0,
  });
  const [collapsed, setCollapsed] = useState(false);
  const jumpToObject = useCallback(seekToObject(player, file), [player, file]);
  const jumpToScene = useCallback(seekToScene(player, file), [player, file]);
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
            onReady={callEach<VideoPlayerAPI>(setPlayer, onPlayerReady)}
            onProgress={setProgress}
            actions={playerActions}
            suppressErrors
          />
          <LoadableObjectTimeLine
            file={file}
            className={classes.objects}
            onSelect={jumpToObject}
          />
        </div>
      </Collapse>
      <div className={classes.divider} />
      <SceneSelector
        scenes={file.scenes}
        onSelect={jumpToScene}
        className={classes.scenes}
        played={progress.played * (file.metadata?.length || 0)}
        collapsible={collapsible}
      />
    </Paper>
  );
}

type VideoPlayerPaneProps = {
  /**
   * Video file
   */
  file: VideoFile;

  /**
   * Return video-player controller
   */
  onPlayerReady?: (player: VideoPlayerAPI) => void;

  /**
   * Enable or disable pane collapse feature.
   */
  collapsible?: boolean;

  /**
   * Video Player Actions
   */
  playerActions?: React.ReactNode;
  className?: string;
};
export default VideoPlayerPane;
