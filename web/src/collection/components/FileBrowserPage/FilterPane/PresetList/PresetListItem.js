import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { ButtonBase, IconButton, Tooltip } from "@material-ui/core";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import PresetType from "../../../../prop-types/PresetType";
import { useIntl } from "react-intl";
import Spacer from "../../../../../common/components/Spacer";

const useStyles = makeStyles((theme) => ({
  preset: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    borderBottomColor: theme.palette.dividerLight,
    borderBottomWidth: 1,
    borderBottomStyle: ({ divider }) => (divider ? "solid" : "none"),
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  title: {
    ...theme.mixins.textEllipsis,
  },
  button: {
    marginLeft: theme.spacing(1),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    delete: intl.formatMessage({ id: "actions.delete" }),
    edit: intl.formatMessage({ id: "actions.edit" }),
  };
}

function PresetListItem(props) {
  const {
    preset,
    onClick,
    onDelete,
    onUpdate,
    divider = false,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const messages = useMessages({ divider });

  const handleDelete = useCallback(
    (event) => {
      event.stopPropagation();
      onDelete(preset);
    },
    [preset, onDelete]
  );

  const handleUpdate = useCallback(
    (event) => {
      event.stopPropagation();
      onUpdate(preset);
    },
    [preset, onUpdate]
  );

  const handleMouseDown = useCallback((event) => event.stopPropagation());

  const handleClick = useCallback(() => onClick(preset), [preset, onClick]);

  return (
    <ButtonBase
      component="div"
      focusRipple
      onClick={handleClick}
      className={clsx(classes.preset, className)}
      {...other}
    >
      <div className={classes.title}>{preset.name}</div>
      <Spacer />
      <Tooltip title={messages.edit}>
        <IconButton
          size="small"
          aria-label={messages.edit}
          onClick={handleUpdate}
          onMouseDown={handleMouseDown}
          className={classes.button}
        >
          <EditOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={messages.delete}>
        <IconButton
          size="small"
          aria-label={messages.delete}
          onClick={handleDelete}
          onMouseDown={handleMouseDown}
          className={classes.button}
        >
          <DeleteOutlinedIcon />
        </IconButton>
      </Tooltip>
    </ButtonBase>
  );
}

PresetListItem.propTypes = {
  /**
   * Preset to be displayed.
   */
  preset: PresetType.isRequired,
  /**
   * Handle preset delete.
   */
  onDelete: PropTypes.func.isRequired,
  /**
   * Handle preset update.
   */
  onUpdate: PropTypes.func.isRequired,
  /**
   * Handle preset click.
   */
  onClick: PropTypes.func.isRequired,
  /**
   * Render a divider below the list item.
   */
  divider: PropTypes.bool,
  className: PropTypes.string,
};

export default PresetListItem;
