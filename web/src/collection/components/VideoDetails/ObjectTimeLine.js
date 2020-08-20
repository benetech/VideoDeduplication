import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FingerprintType } from "../Fingerprints/type";
import ObjectGroup from "./ObjectGroup";

const useStyles = makeStyles((theme) => ({
  timeline: {
    /**
     * Required for child-elements absolute positioning
     */
    transform: "translate(0%, 0px)",
  },
}));

/**
 * Split all objects into the close groups
 */
function groupObjects(objects, fullLength, minDist = 0.05) {
  if (objects.length === 0) {
    return [];
  }

  // Sort objects by position in ascending order
  objects = [...objects];
  objects.sort((first, second) => first.position - second.position);

  // Group objects
  let currentGroup = [objects[0]];
  const groups = [currentGroup];

  for (let i = 1; i < objects.length; i++) {
    const currentObject = objects[i];
    const groupStart = currentGroup[0].position / fullLength;
    const position = currentObject.position / fullLength;
    if (position - groupStart < minDist) {
      // if distance is small enough add object to the current group
      currentGroup.push(currentObject);
    } else {
      // otherwise create a new group and add it to the result collection
      currentGroup = [currentObject];
      groups.push(currentGroup);
    }
  }

  return groups;
}

/**
 * Video file timeline with recognized objects.
 */
function ObjectTimeLine(props) {
  const { file, className } = props;
  const classes = useStyles();

  const groups = groupObjects(file.objects, file.metadata.length, 0.02);

  return (
    <div className={clsx(classes.timeline, className)}>
      {groups.map((group) => (
        <ObjectGroup
          key={group[0].position}
          fullLength={file.metadata.length}
          objects={group}
        />
      ))}
    </div>
  );
}

ObjectTimeLine.propTypes = {
  /**
   * Video file metadata
   */
  file: FingerprintType.isRequired,
  className: PropTypes.string,
};

export default ObjectTimeLine;
