import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import { useIntl } from "react-intl";
import Button from "../../../common/components/Button";
import IconKind from "../../state/templates/IconKind";
import TemplateIconPreview from "./TemplateList/TemplateIconPreview";
import { useServer } from "../../../server-api/context";
import { useDispatch } from "react-redux";
import { addTemplates } from "../../state/templates/actions";
import nameErrorMessage from "./nameErrorMessage";

const useStyles = makeStyles((theme) => ({
  content: {
    display: "flex",
    alignItems: "flex-start",
  },
  icon: {
    width: 40,
    height: 40,
    fontSize: 40,
    margin: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(3),
    minWidth: 250,
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "actions.addTemplate" }),
    cancel: intl.formatMessage({ id: "actions.cancel" }),
    create: intl.formatMessage({ id: "actions.create" }),
    defaultName: intl.formatMessage({ id: "templates.name" }),
    nameError: (error) => nameErrorMessage(intl, error),
  };
}

const defaultIcon = {
  kind: IconKind.PREDEFINED,
  key: "GiPoliceOfficerHead",
};

function AddTemplateDialog(props) {
  const { open, onClose, className, ...other } = props;
  const server = useServer();
  const classes = useStyles();
  const dispatch = useDispatch();
  const messages = useMessages();
  const [icon, setIcon] = useState(defaultIcon);
  const [name, setName] = useState(messages.defaultName);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const handleNameChange = useCallback((event) => {
    setName(event.target.value);
    setNameError("");
  }, []);

  // Reset dialog state on open
  useEffect(() => {
    if (open) {
      setLoading(false);
      setIcon(defaultIcon);
      setName(messages.defaultName);
      setNameError("");
    }
  }, [open]);

  const handleCreate = useCallback(() => {
    setLoading(true);
    server
      .createTemplate({ template: { name, icon } })
      .then((response) => {
        if (response.success) {
          dispatch(addTemplates([response.data]));
          onClose();
        } else {
          setNameError(messages.nameError(response?.data?.fields?.name));
          console.error("Creating template failed", response);
        }
      })
      .catch((error) => console.error("Error creating template", error))
      .finally(() => {
        setLoading(false);
      });
  }, [name, icon]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={clsx(className)}
      {...other}
    >
      <DialogTitle>{messages.title}</DialogTitle>
      <DialogContent>
        <div className={classes.content}>
          <TemplateIconPreview
            onChange={setIcon}
            icon={icon}
            edit
            className={classes.icon}
          />
          <TextField
            value={name}
            onChange={handleNameChange}
            className={classes.title}
            color="secondary"
            error={!!nameError}
            helperText={nameError}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          disabled={!name || loading || !!nameError}
        >
          {messages.create}
        </Button>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          {messages.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddTemplateDialog.propTypes = {
  /**
   * Controls dialog visibility.
   */
  open: PropTypes.bool.isRequired,
  /**
   * Handle dialog close.
   */
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default AddTemplateDialog;
