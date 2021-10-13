import React, { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { Scene } from "../../../model/VideoFile";
import SceneList from "./SceneList";
import SceneView from "./SceneView";
import { useIntl } from "react-intl";
import CollapseButton from "../../../components/basic/CollapseButton";
import Collapse from "@material-ui/core/Collapse";
import LabeledSwitch from "../../../components/basic/LabeledSwitch";

const useStyles = makeStyles<Theme>((theme) => ({
  sceneSelector: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  title: { ...theme.mixins.title3, fontWeight: "bold", flexGrow: 1 },
  collapseButton: {
    flexGrow: 0,
    marginLeft: theme.spacing(3),
  },
  scenes: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  scene: {
    cursor: "pointer",
  },
}));

/**
 * Get index of the scene being played at the moment.
 */
function selectedScene(scenes: Scene[], played: number): number {
  let selected = -1;

  for (const [index, scene] of scenes.entries()) {
    if (scene.position <= played) {
      selected = index;
    } else {
      break;
    }
  }

  return selected;
}

function useMessages() {
  const intl = useIntl();
  return {
    scenes: intl.formatMessage({
      id: "file.scenes",
    }),
    blurDescription: intl.formatMessage({
      id: "aria.label.blurAllScenes",
    }),
    blurAction: intl.formatMessage({
      id: "actions.blurScenes",
    }),
  };
}

/**
 * Get list of scenes sorted by position.
 */
function sorted(scenes: Scene[]): Scene[] {
  const result = [...scenes];
  return result.sort((a, b) => a.position - b.position);
}

function SceneSelector(props: SceneSelectorProps): JSX.Element {
  const {
    scenes: scenesProp,
    played,
    onSelect,
    collapsible,
    className,
  } = props;
  const classes = useStyles();
  const scenes = useMemo(() => sorted(scenesProp), [scenesProp]);
  const selected = selectedScene(scenes, played || 0);
  const messages = useMessages();
  const [collapsed, setCollapsed] = useState(false);
  const [blur, setBlur] = useState(true);
  const handleCollapse = useCallback(
    () => setCollapsed(!collapsed),
    [collapsed]
  );
  return (
    <div className={clsx(classes.sceneSelector, className)}>
      <div className={classes.header}>
        <div className={classes.title}>
          {scenes.length} {messages.scenes}
        </div>
        <LabeledSwitch
          value={blur}
          onChange={setBlur}
          label={messages.blurAction}
          tooltip={messages.blurDescription}
        />
        {collapsible && (
          <CollapseButton
            className={classes.collapseButton}
            collapsed={collapsed}
            onClick={handleCollapse}
            size="small"
          />
        )}
      </div>
      <Collapse in={!collapsed}>
        <SceneList className={classes.scenes}>
          {scenes.map((scene, index) => (
            <SceneView
              scene={scene}
              onSelect={onSelect}
              selected={index === selected}
              className={classes.scene}
              key={scene.position}
              blur={blur}
            />
          ))}
        </SceneList>
      </Collapse>
    </div>
  );
}

type SceneSelectorProps = {
  /**
   * Fires when user click on a particular scene
   */
  onSelect?: (scene: Scene) => void;

  /**
   * Scenes in a vide
   */
  scenes: Scene[];

  /**
   * Current playback position used to determine scene being displayed
   */
  played?: number;

  /**
   * Enable or disable pane collapse feature.
   */
  collapsible?: boolean;
  className?: string;
};
export default SceneSelector;
