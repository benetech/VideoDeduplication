import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import SceneType from "./SceneType";
import MediaPreview from "../../../common/components/MediaPreview";
import TimeCaption from "./TimeCaption";

const useStyles = makeStyles((theme) => ({
  scene: {
    width: 180,
    height: 100,
    flexShrink: 0,
    margin: theme.spacing(0.5),
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "rgba(0,0,0,0)",
    borderRadius: theme.spacing(0.5),
  },
  selected: {
    borderColor: theme.palette.primary.main,
  },
}));

function Scene(props) {
  const { scene, onSelect, selected = false, className } = props;
  const classes = useStyles();

  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(scene);
    }
  }, [scene, onSelect]);

  return (
    <MediaPreview
      className={clsx(classes.scene, selected && classes.selected, className)}
      src={scene.preview}
      alt="scene"
      caption={<TimeCaption time={scene.position} />}
      onClick={handleSelect}
    />
  );
}

Scene.propTypes = {
  onSelect: PropTypes.func,
  selected: PropTypes.bool,
  scene: SceneType.isRequired,
  className: PropTypes.string,
};

export default Scene;
