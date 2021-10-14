import React, { useMemo } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { VideoFile } from "../../../model/VideoFile";
import ObjectGroup from "./ObjectGroup";
import { groupObjects } from "../groupObjects";
import { useIntl } from "react-intl";
import { TemplateMatch } from "../../../model/Template";

const useStyles = makeStyles<Theme>(() => ({
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

function ObjectTimeLine(props: ObjectTimeLineProps): JSX.Element {
  const {
    file,
    objects: objectsProp = [],
    onSelect = () => null,
    className,
  } = props;
  const classes = useStyles();
  const intl = useIntl();
  const objects = useMemo(
    () => objectsProp.filter((object) => !object.falsePositive),
    [objectsProp]
  );
  const groups = groupObjects(objects, (file.metadata?.length || 0) * 0.02);
  return (
    <div
      className={clsx(classes.timeline, className)}
      aria-label={intl.formatMessage({
        id: "aria.label.objectTimeline",
      })}
    >
      {groups.map((group, index) => (
        <ObjectGroup
          key={index}
          fullLength={file.metadata?.length || 0}
          objects={group}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

type ObjectTimeLineProps = {
  /**
   * Video file metadata
   */
  file: VideoFile;

  /**
   * Recognized objects (template matches).
   */
  objects: TemplateMatch[];

  /**
   * Handle jump to a particular object
   */
  onSelect?: (object: TemplateMatch) => void;
  className?: string;
};
export default ObjectTimeLine;
