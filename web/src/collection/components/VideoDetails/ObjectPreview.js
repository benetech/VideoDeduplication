import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ObjectType from "./ObjectType";
import ObjectKinds from "./ObjectKinds";
import { formatDuration } from "../../../common/helpers/format";

const useStyles = makeStyles((theme) => ({
  preview: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    paddingRight: theme.spacing(1),
  },
  time: {
    cursor: "pointer",
  },
}));

/**
 * Get object kind
 */
function objectKind(object) {
  return ObjectKinds[object.kind];
}

/**
 * Get string representation of object time position
 */
function objectTime(object) {
  return formatDuration(object.position, null, false);
}

/**
 * A small preview for recognized object. Allows to jump to the object location.
 */
function ObjectPreview(props) {
  const { object, onJump, className } = props;
  const classes = useStyles();
  const Icon = objectKind(object).icon;
  const time = objectTime(object);

  return (
    <div className={clsx(classes.preview, className)}>
      <Icon className={classes.icon} />
      <div className={classes.time} onClick={() => onJump(object)}>
        {time}
      </div>
    </div>
  );
}

ObjectPreview.propTypes = {
  /**
   * Recognized object
   */
  object: ObjectType.isRequired,
  /**
   * Handle click on object
   */
  onJump: PropTypes.func,
  className: PropTypes.string,
};

export default ObjectPreview;
