import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import IconButton from "@material-ui/core/IconButton";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import DoneOutlinedIcon from "@material-ui/icons/DoneOutlined";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import { useIntl } from "react-intl";
import { TextField } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    ...theme.mixins.title3,
    ...theme.mixins.textEllipsis,
    fontWeight: "bold",
    flexShrink: 1,
    marginRight: theme.spacing(1),
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
    fieldLabel: intl.formatMessage({ id: "templates.name" }),
    editName: intl.formatMessage({ id: "actions.editName" }),
    editIcon: intl.formatMessage({ id: "actions.editIcon" }),
  };
}

function TemplateTitle(props) {
  const { name, edit, onChange, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [editing, setEditing] = useState(false);
  const [staging, setStaging] = useState(name);

  // Reset staging when name is changed
  useEffect(() => {
    setStaging(name);
  }, [name]);

  // Reset state when editing is disabled
  useEffect(() => {
    setEditing(false);
    setStaging(name);
  }, [edit]);

  const handleChange = useCallback((event) => setStaging(event.target.value));
  const handleEdit = useCallback(() => setEditing(true));
  const handleCancel = useCallback(() => {
    setEditing(false);
    setStaging(name);
  }, [name]);
  const handleDone = useCallback(() => {
    setEditing(false);
    onChange(staging);
  }, [onChange, staging]);

  if (!editing) {
    return (
      <div className={clsx(classes.container, className)} {...other}>
        <div className={classes.title}>{name}</div>
        {edit && (
          <IconButton
            onClick={handleEdit}
            className={classes.button}
            size="small"
          >
            <EditOutlinedIcon />
          </IconButton>
        )}
      </div>
    );
  } else {
    return (
      <div className={clsx(classes.container, className)} {...other}>
        <TextField value={staging} onChange={handleChange} color="secondary" />
        <IconButton
          onClick={handleDone}
          className={classes.button}
          size="small"
        >
          <DoneOutlinedIcon />
        </IconButton>
        <IconButton
          onClick={handleCancel}
          className={classes.button}
          size="small"
        >
          <ClearOutlinedIcon />
        </IconButton>
      </div>
    );
  }
}

TemplateTitle.propTypes = {
  /**
   * Template name.
   */
  name: PropTypes.string.isRequired,
  /**
   * Enable edit mode.
   */
  edit: PropTypes.bool,
  /**
   * Handle name change.
   */
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default TemplateTitle;
