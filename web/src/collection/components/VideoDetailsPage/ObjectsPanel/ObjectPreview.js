import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/styles";
import ObjectType from "../../../../application/objects/prop-types/ObjectType";
import Tooltip from "@material-ui/core/Tooltip";
import { formatDuration } from "../../../../common/helpers/format";
import position from "../objectPosition";
import SquaredIconButton from "../../../../common/components/SquaredIconButton";
import TemplateIcon from "../../TemplatesPage/TemplateIcon/TemplateIcon";
import Fab from "@material-ui/core/Fab";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
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
  overlayContainer: {
    transform: "translate(0%, 0px)",
  },
  overlay: {
    position: "absolute",
    top: -5,
    right: -5,
    display: ({ hover }) => (hover ? "flex" : "none"),
    width: 24,
    height: 24,
    minHeight: 24,
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

function ObjectPreview(props) {
  const { object, onJump, onDelete, className, ...other } = props;
  const [hover, setHover] = useState(false);
  const classes = useStyles({ hover });
  const intl = useIntl();

  const handleJump = useCallback(() => onJump(object), [object, onJump]);
  const handleDelete = useCallback(() => onDelete(object), [object, onJump]);
  const handleMouseOver = useCallback(() => setHover(true));
  const handleMouseOut = useCallback(() => setHover(false));

  return (
    <ObjectTooltip
      arrow
      className={clsx(className)}
      title={description(object, intl)}
      {...other}
    >
      <div
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseOut}
        className={classes.overlayContainer}
      >
        <SquaredIconButton
          variant="text"
          className={classes.object}
          onClick={handleJump}
          aria-label={description(object, intl)}
          data-selector="ObjectListItemButton"
          data-object-id={object.id}
        >
          <TemplateIcon icon={object.template?.icon} />
        </SquaredIconButton>
        <Fab
          onClick={handleDelete}
          size="small"
          color="default"
          className={classes.overlay}
        >
          <CloseOutlinedIcon fontSize="small" />
        </Fab>
      </div>
    </ObjectTooltip>
  );
}

ObjectPreview.propTypes = {
  /**
   * Object to be displayed
   */
  object: ObjectType.isRequired,
  /**
   * Jump to a particular object
   */
  onJump: PropTypes.func.isRequired,
  /**
   * Delete object.
   */
  onDelete: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default ObjectPreview;
