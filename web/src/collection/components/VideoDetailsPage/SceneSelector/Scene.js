import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import SceneType from "../../../prop-types/SceneType";
import MediaPreview from "../../../../common/components/MediaPreview";
import TimeCaption from "../TimeCaption";
import { useIntl } from "react-intl";
import { formatDuration } from "../../../../common/helpers/format";

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

/**
 * Get i18n text
 */
function useMessages(scene) {
  const intl = useIntl();
  const time = formatDuration(scene.position, null, false);
  return {
    ariaLabel: intl.formatMessage({ id: "aria.label.scene" }, { time }),
  };
}

function Scene(props) {
  const { scene, onSelect, selected = false, className } = props;
  const classes = useStyles();
  const messages = useMessages(scene);

  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(scene);
    }
  }, [scene, onSelect]);

  /**
   * Seek video to the given scene on keyboard actions
   */
  const handleKeyDown = useCallback(
    (event) => {
      const key = event.key;
      if (key === " " || key === "Enter") {
        handleSelect();
      }
    },
    [handleSelect]
  );

  return (
    <MediaPreview
      className={clsx(classes.scene, selected && classes.selected, className)}
      src={scene.preview}
      alt="scene"
      caption={<TimeCaption time={scene.position} />}
      onClick={handleSelect}
      aria-label={messages.ariaLabel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
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
