import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles, withStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { Template, TemplateMatch } from "../../../model/Template";
import Tooltip from "@material-ui/core/Tooltip";
import { formatDuration } from "../../../lib/helpers/format";
import position from "../objectPosition";
import SquaredIconButton from "../../../components/basic/SquaredIconButton";
import TemplateIconViewer from "../../../components/templates/TemplateIcon/TemplateIconViewer";
import Fab from "@material-ui/core/Fab";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import { IntlShape, useIntl } from "react-intl";

type ObjectPreviewStyleProps = {
  hover: boolean;
};

const useStyles = makeStyles<Theme, ObjectPreviewStyleProps>((theme) => ({
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

function description(object: TemplateMatch, intl: IntlShape): string {
  const name = object.template?.name;
  const time = formatDuration(position(object), intl, false);
  return intl.formatMessage(
    {
      id: "object.description",
    },
    {
      type: name,
      time,
    }
  );
}

function ObjectPreview(props: ObjectPreviewProps): JSX.Element {
  const { object, template, onSelect, onDelete, className, ...other } = props;
  const [hover, setHover] = useState(false);
  const classes = useStyles({
    hover,
  });
  const intl = useIntl();
  const handleJump = useCallback(() => onSelect(object), [object, onSelect]);
  const handleDelete = useCallback(() => onDelete(object), [object, onSelect]);
  const handleMouseOver = useCallback(() => setHover(true), []);
  const handleMouseOut = useCallback(() => setHover(false), []);
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
          <TemplateIconViewer icon={template?.icon} />
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

type ObjectPreviewProps = {
  /**
   * Object to be displayed
   */
  object: TemplateMatch;

  /**
   * Template associated with the object.
   */
  template: Template;

  /**
   * Jump to a particular object
   */
  onSelect: (object: TemplateMatch) => void;

  /**
   * Delete object.
   */
  onDelete: (object: TemplateMatch) => void;
  className?: string;
};
export default ObjectPreview;
