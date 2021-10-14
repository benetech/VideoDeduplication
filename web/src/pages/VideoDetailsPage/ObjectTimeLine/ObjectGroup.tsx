import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { ButtonBase, Theme } from "@material-ui/core";
import { TemplateMatch } from "../../../model/Template";
import usePopup from "../../../lib/hooks/usePopup";
import ObjectGroupPopper from "./ObjectGroupPopper";
import { useIntl } from "react-intl";
import { objectTime } from "./helpers/objectTime";
import position from "../objectPosition";

const useStyles = makeStyles<Theme>((theme) => ({
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

function relativePosition(
  objects: TemplateMatch[],
  fullLength: number
): number {
  const first = Math.min(...objects.map(position));
  return first / fullLength;
}

/**
 * Convert fraction to CSS Percents
 */
function percents(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * A point on the video timeline representing a close group
 * of recognized objects.
 */
function ObjectGroup(props: ObjectGroupProps): JSX.Element {
  const { objects, fullLength, onSelect, className } = props;
  const classes = useStyles();
  const { popup, clickTrigger } = usePopup<HTMLButtonElement>("object-group");
  const intl = useIntl();
  const left = percents(relativePosition(objects, fullLength));

  /**
   * Move focus back to the object group when popper is closed by
   * the keyboard action.
   */
  const handlePopperClose = useCallback(() => {
    clickTrigger.ref.current?.focus();
  }, [clickTrigger.ref]);
  return (
    <React.Fragment>
      <ButtonBase
        className={clsx(classes.objectGroup, className)}
        style={{
          left,
        }}
        {...clickTrigger}
        focusRipple
        disableTouchRipple
        aria-label={intl.formatMessage(
          {
            id: "aria.label.objectGroup",
          },
          {
            time: objectTime(objects[0], intl),
          }
        )}
      />
      <ObjectGroupPopper
        objects={objects}
        onSelect={onSelect}
        onKeyClose={handlePopperClose}
        {...popup}
      />
    </React.Fragment>
  );
}

type ObjectGroupProps = {
  /**
   * Full video-file length in milliseconds
   */
  fullLength: number;

  /**
   * Objects comprising the group.
   */
  objects: TemplateMatch[];

  /**
   * Handle jump to a particular object
   */
  onSelect: (object: TemplateMatch) => void;
  className?: string;
};
export default ObjectGroup;
