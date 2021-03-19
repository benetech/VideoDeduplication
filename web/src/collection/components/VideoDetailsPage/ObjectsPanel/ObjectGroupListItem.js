import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/styles";
import ObjectType from "../../../prop-types/ObjectType";
import TimeCaption from "../TimeCaption";
import SquaredIconButton from "../../../../common/components/SquaredIconButton";
import Tooltip from "@material-ui/core/Tooltip";
import { formatDuration } from "../../../../common/helpers/format";
import { useIntl } from "react-intl";
import { ButtonBase } from "@material-ui/core";
import position from "../objectPosition";
import TemplateIcon from "../../TemplatesPage/TemplateIcon/TemplateIcon";

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
}));

/**
 * Tooltip to display object description
 */
const ObjectTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.action.textInactive,
    boxShadow: "2px 2px 14px 2px rgba(0,0,0,0.18)",
    fontFamily: "Roboto",
    fontSize: 16,
    letterSpacing: 0,
    fontWeight: "normal",
    lineHeight: "19px",
    padding: theme.spacing(1),
  },
  arrow: {
    color: theme.palette.common.white,
  },
}))(Tooltip);

function description(object, intl) {
  const name = object.template?.name;
  const time = formatDuration(position(object), null, false);
  return intl.formatMessage({ id: "object.description" }, { type: name, time });
}

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
  const { objects, onJump, className } = props;
  const classes = useStyles();
  const intl = useIntl();

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
          <ObjectTooltip
            arrow
            title={description(object, intl)}
            key={object.id}
          >
            <SquaredIconButton
              variant="text"
              className={classes.object}
              onClick={() => onJump(object)}
              aria-label={description(object, intl)}
            >
              <TemplateIcon icon={object.template?.icon} />
            </SquaredIconButton>
          </ObjectTooltip>
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
  onJump: PropTypes.func,
  className: PropTypes.string,
};

export default ObjectGroupListItem;
