import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ObjectType from "./ObjectType";

const useStyles = makeStyles((theme) => ({
  objectGroup: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.primary.main,
    cursor: "pointer",
    position: "absolute",
    top: "50%",
  },
}));

/**
 * Get relative start position of the group
 */
function relativePosition(objects, fullLength) {
  const first = Math.min(...objects.map((object) => object.position));
  return first / fullLength;
}

/**
 * Convert fraction to CSS Percents
 */
function percents(value) {
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * A point on the video timeline representing a close group
 * of recognized objects.
 */
function ObjectGroup(props) {
  const { objects, fullLength, className } = props;
  const classes = useStyles();

  const left = percents(relativePosition(objects, fullLength));

  return (
    <div className={clsx(classes.objectGroup, className)} style={{ left }} />
  );
}

ObjectGroup.propTypes = {
  /**
   * Full video-file length in milliseconds
   */
  fullLength: PropTypes.number.isRequired,
  /**
   * Objects comprising the group.
   */
  objects: PropTypes.arrayOf(ObjectType).isRequired,
  className: PropTypes.string,
};

export default ObjectGroup;
