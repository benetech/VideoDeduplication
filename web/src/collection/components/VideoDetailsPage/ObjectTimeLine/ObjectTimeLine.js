import React, { useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../../prop-types/FileType";
import ObjectGroup from "./ObjectGroup";
import { groupObjects } from "../groupObjects";
import { useIntl } from "react-intl";
import ObjectType from "../../../../application/objects/prop-types/ObjectType";

const useStyles = makeStyles(() => ({
  timeline: {
    /**
     * Required for child-elements absolute positioning
     */
    transform: "translate(0%, 0px)",
  },
}));

/**
 * Video file timeline with recognized objects.
 */
function ObjectTimeLine(props) {
  const { file, objects: objectsProp = [], onJump, className } = props;
  const classes = useStyles();
  const intl = useIntl();

  const objects = useMemo(
    () => objectsProp.filter((object) => !object.falsePositive),
    [objectsProp]
  );
  const groups = groupObjects(objects, file.metadata.length * 0.02);

  return (
    <div
      className={clsx(classes.timeline, className)}
      aria-label={intl.formatMessage({ id: "aria.label.objectTimeline" })}
    >
      {groups.map((group, index) => (
        <ObjectGroup
          key={index}
          fullLength={file.metadata.length}
          objects={group}
          onJump={onJump}
        />
      ))}
    </div>
  );
}

ObjectTimeLine.propTypes = {
  /**
   * Video file metadata
   */
  file: FileType.isRequired,
  /**
   * Recognized objects (template matches).
   */
  objects: PropTypes.arrayOf(ObjectType).isRequired,
  /**
   * Handle jump to a particular object
   */
  onJump: PropTypes.func,
  className: PropTypes.string,
};

export default ObjectTimeLine;
