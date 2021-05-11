import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ObjectType from "../../../../application/objects/prop-types/ObjectType";
import TimeCaption from "../TimeCaption";
import { formatDuration } from "../../../../common/helpers/format";
import { useIntl } from "react-intl";
import { ButtonBase } from "@material-ui/core";
import position from "../objectPosition";
import ObjectPreview from "./ObjectPreview";
import ObjectAPI from "../../../../application/objects/ObjectAPI";

const useStyles = makeStyles((theme) => ({
  groupListItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.dividerLight}`,
  },
  caption: {
    cursor: "pointer",
    margin: theme.spacing(1),
    padding: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  },
  objects: {
    display: "flex",
    alignItems: "center",
  },
  object: {
    margin: theme.spacing(1),
    width: 50,
    height: 50,
    lineHeight: 1,
    "&:hover": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
    },
  },
  objectWrapper: {
    transform: "translate(0%, 0px)",
  },
  overlay: {
    position: "absolute",
    top: -5,
    right: -5,
    display: ({ show }) => (show ? "flex" : "none"),
    width: 24,
    height: 24,
    minHeight: 24,
  },
}));

/**
 * Start position of the object group
 */
function startTime(objects) {
  return Math.min(...objects.map(position));
}

/**
 * Get a11y label for time caption
 */
function captionLabel(objects, intl) {
  const time = formatDuration(startTime(objects), null, false);
  return intl.formatMessage({ id: "aria.label.objectGroup" }, { time });
}

function ObjectGroupListItem(props) {
  const { objects, onJump, onDelete, className } = props;
  const intl = useIntl();
  const classes = useStyles();

  const position = startTime(objects);

  return (
    <div className={clsx(classes.groupListItem, className)}>
      <TimeCaption
        time={position}
        className={classes.caption}
        onClick={() => onJump({ position })}
        component={ButtonBase}
        focusRipple
        disableTouchRipple
        aria-label={captionLabel(objects, intl)}
      />
      <div className={classes.objects}>
        {objects.map((object) => (
          <ObjectPreview
            object={object}
            onJump={onJump}
            onDelete={onDelete}
            key={object.id}
          />
        ))}
      </div>
    </div>
  );
}

ObjectGroupListItem.propTypes = {
  /**
   * Objects comprising the group
   */
  objects: PropTypes.arrayOf(ObjectType).isRequired,
  /**
   * Jump to a particular object
   */
  onJump: PropTypes.func.isRequired,
  /**
   * Handle delete a particular object
   */
  onDelete: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default ObjectGroupListItem;
