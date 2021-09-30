import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { TextField, Theme } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import DoneOutlinedIcon from "@material-ui/icons/DoneOutlined";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import nameErrorMessage from "../../../lib/messages/nameErrorMessage";
import { useIntl } from "react-intl";
import { ValidationError } from "../../../server-api/ServerError";

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
    minHeight: 54,
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

function TemplateTitle(props: TemplateTitleProps): JSX.Element {
  const { name, edit, onChange, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  const [editing, setEditing] = useState(false);
  const [staging, setStaging] = useState(name);
  const [nameError, setNameError] = useState("");
  const [progress, setProgress] = useState(false); // Reset state when editing is disabled

  useEffect(() => {
    setEditing(false);
    setStaging(name);
    setProgress(false);
    setNameError("");
  }, [edit]);

  const handleChange = useCallback((event) => {
    setNameError("");
    setStaging(event.target.value);
  }, []);

  const handleEdit = useCallback(() => setEditing(true), []);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setStaging(name);
  }, [name]);

  const handleDone = useCallback(async () => {
    setProgress(true);

    try {
      if (onChange != null) {
        await onChange(staging);
      } else {
        console.error("onChange is not supplied.");
      }
      setEditing(false);
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorCode = error.fields?.name;
        setNameError(nameErrorMessage(intl, errorCode));
      }
    } finally {
      setProgress(false);
    }
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
        <TextField
          value={staging}
          onChange={handleChange}
          disabled={progress}
          color="secondary"
          error={!!nameError}
          helperText={nameError}
        />
        <IconButton
          onClick={handleDone}
          className={classes.button}
          size="small"
          disabled={progress}
        >
          <DoneOutlinedIcon />
        </IconButton>
        <IconButton
          onClick={handleCancel}
          className={classes.button}
          size="small"
          disabled={progress}
        >
          <ClearOutlinedIcon />
        </IconButton>
      </div>
    );
  }
}

type TemplateTitleProps = {
  /**
   * Template name.
   */
  name: string;

  /**
   * Enable edit mode.
   */
  edit?: boolean;

  /**
   * Handle name change.
   */
  onChange?: (name: string) => void;
  className?: string;
};
export default TemplateTitle;
