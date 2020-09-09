import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../FileBrowserPage/FileType";
import ObjectGroup from "./ObjectGroup";
import { groupObjects } from "../groupObjects";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
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
  const { file, onJump, className } = props;
  const classes = useStyles();
  const intl = useIntl();

  const groups = groupObjects(file.objects, file.metadata.length * 0.02);

  return (
    <div
      className={clsx(classes.timeline, className)}
      aria-label={intl.formatMessage({ id: "aria.label.objectTimeline" })}
    >
      {groups.map((group) => (
        <ObjectGroup
          key={group[0].position}
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
   * Handle jump to a particular object
   */
  onJump: PropTypes.func,
  className: PropTypes.string,
};

export default ObjectTimeLine;
