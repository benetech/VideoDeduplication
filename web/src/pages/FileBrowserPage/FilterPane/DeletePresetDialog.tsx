import React, { useCallback } from "react";
import clsx from "clsx";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { useIntl } from "react-intl";
import Button from "../../../components/basic/Button";
import { Preset } from "../../../model/Preset";

/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({
      id: "presets.deletePreset.title",
    }),
    description: (name: string) =>
      intl.formatMessage(
        {
          id: "presets.deletePreset.description",
        },
        {
          name,
        }
      ),
    delete: intl.formatMessage({
      id: "actions.delete",
    }),
    cancel: intl.formatMessage({
      id: "actions.cancel",
    }),
  };
}

function DeletePresetDialog(props: DeletePresetDialogProps): JSX.Element {
  const { preset, onDelete, open, onClose, className, ...other } = props;
  const messages = useMessages();
  const handleDelete = useCallback(() => {
    onDelete(preset);
    onClose();
  }, [onDelete, preset]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={clsx(className)}
      {...other}
    >
      <DialogTitle>{messages.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {messages.description(preset.name)}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleDelete}>
          {messages.delete}
        </Button>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          {messages.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type DeletePresetDialogProps = {
  /**
   * Preset being deleted.
   */
  preset: Preset;

  /**
   * Controls dialog visibility.
   */
  open: boolean;

  /**
   * Handle dialog close.
   */
  onClose: (...args: any[]) => void;

  /**
   * Handle attempt to delete preset.
   */
  onDelete: (...args: any[]) => void;
  className?: string;
};
export default DeletePresetDialog;
