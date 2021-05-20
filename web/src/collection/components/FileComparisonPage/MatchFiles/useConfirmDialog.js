import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import Button from "../../../../common/components/Button";
import { useIntl } from "react-intl";

/**
 * Get translated text
 */
function useMessages() {
  const intl = useIntl();
  return {
    cancel: intl.formatMessage({ id: "actions.cancel" }),
  };
}

/**
 * Open simple confirmation dialog.
 */
export default function useConfirmDialog(
  title,
  description,
  yesText,
  action,
  deps
) {
  const [open, setOpen] = useState(false);
  const messages = useMessages();
  const handleOpen = useCallback(() => setOpen(true));
  const handleClose = useCallback(() => setOpen(false));
  const handleConfirm = useCallback(() => {
    action();
    handleClose();
  }, deps);

  const ConfirmDialog = (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirm} color="primary" autoFocus>
          {yesText}
        </Button>
        <Button onClick={handleClose} color="secondary">
          {messages.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return [ConfirmDialog, handleOpen];
}
