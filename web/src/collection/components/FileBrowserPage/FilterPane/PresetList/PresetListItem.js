import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { ButtonBase, IconButton, Tooltip } from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import PresetType from "../../../../prop-types/PresetType";
import { useIntl } from "react-intl";
import Spacer from "../../../../../common/components/Spacer";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: theme.spacing(2),
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    display: "flex",
    alignItems: "center",
  },
  title: {
    ...theme.mixins.textEllipsis,
  },
  button: {},
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    delete: intl.formatMessage({ id: "actions.delete" }),
  };
}

function PresetListItem(props) {
  const { preset, onClick, onDelete, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  const handleDelete = useCallback(() => onDelete(preset), [preset, onDelete]);
  const handleClick = useCallback(() => onClick(preset), [preset, onClick]);

  return (
    <ButtonBase
      component="div"
      focusRipple
      onClick={handleClick}
      className={clsx(classes.root, className)}
      {...other}
    >
      <div className={classes.title}>{preset.name}</div>
      <Spacer />
      <Tooltip title={messages.delete}>
        <IconButton
          size="small"
          aria-label={messages.delete}
          onClick={handleDelete}
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
  onDelete: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default PresetListItem;
