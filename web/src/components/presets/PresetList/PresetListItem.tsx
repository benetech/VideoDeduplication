import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { ButtonBase, IconButton, Theme, Tooltip } from "@material-ui/core";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import { Preset } from "../../../model/Preset";
import { useIntl } from "react-intl";
import Spacer from "../../basic/Spacer";

const useStyles = makeStyles<Theme>((theme) => ({
  preset: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(3),
    borderRadius: theme.spacing(1),
    borderColor: theme.palette.border.light,
    borderWidth: 3,
    borderStyle: "solid",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  title: { ...theme.mixins.title5, ...theme.mixins.textEllipsis },
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
    delete: intl.formatMessage({
      id: "actions.delete",
    }),
    edit: intl.formatMessage({
      id: "actions.edit",
    }),
  };
}

function PresetListItem(props: PresetListItemProps): JSX.Element {
  const { preset, onClick, onDelete, onUpdate, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
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
  const handleMouseDown = useCallback((event) => event.stopPropagation(), []);
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

type PresetListItemProps = {
  /**
   * Preset to be displayed.
   */
  preset: Preset;

  /**
   * Handle preset delete.
   */
  onDelete: (...args: any[]) => void;

  /**
   * Handle preset update.
   */
  onUpdate: (...args: any[]) => void;

  /**
   * Handle preset click.
   */
  onClick: (...args: any[]) => void;
  className?: string;
};
export default PresetListItem;
