import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import { useIntl } from "react-intl";
import Button from "../../../components/basic/Button";
import nameErrorMessage from "../../../lib/messages/nameErrorMessage";
import useFilesColl from "../../../application/api/files/useFilesColl";
import {
  ValidationError,
  ValidationErrorCode,
} from "../../../server-api/ServerError";

/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({
      id: "presets.createPreset.title",
    }),
    description: intl.formatMessage({
      id: "presets.createPreset.description",
    }),
    create: intl.formatMessage({
      id: "actions.create",
    }),
    cancel: intl.formatMessage({
      id: "actions.cancel",
    }),
    name: intl.formatMessage({
      id: "presets.name",
    }),
    nameError: (code: ValidationErrorCode): string =>
      nameErrorMessage(intl, code),
  };
}

function AddPresetDialog(props: AddPresetDialogProps): JSX.Element {
  const { onCreate, open, onClose, className, ...other } = props;
  const messages = useMessages();
  const filters = useFilesColl().params;
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const handleNameChange = useCallback((event) => {
    setNameError("");
    setName(event.target.value);
  }, []);
  const handleCreate = useCallback(async () => {
    setLoading(true);

    try {
      const newPreset = {
        name,
        filters,
      };
      await onCreate(newPreset);
      onClose();
    } catch (error) {
      if (error instanceof ValidationError) {
        setNameError(messages.nameError(error.fields.name));
      } else {
        console.error("Error creating preset", {
          error,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [name, filters, onCreate, onClose]); // Reset dialog state on open

  useEffect(() => {
    if (open) {
      setLoading(false);
      setName("");
      setNameError("");
    }
  }, [open]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={clsx(className)}
      {...other}
    >
      <DialogTitle>{messages.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{messages.description}</DialogContentText>
        <TextField
          required
          autoFocus
          fullWidth
          color="secondary"
          margin="dense"
          label={messages.name}
          value={name}
          onChange={handleNameChange}
          disabled={loading}
          error={!!nameError}
          helperText={nameError}
        />
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

type AddPresetDialogProps = {
  /**
   * Controls dialog visibility.
   */
  open: boolean;

  /**
   * Handle dialog close.
   */
  onClose: (...args: any[]) => void;

  /**
   * Handle attempt to create preset.
   */
  onCreate: (...args: any[]) => void;
  className?: string;
};
export default AddPresetDialog;
