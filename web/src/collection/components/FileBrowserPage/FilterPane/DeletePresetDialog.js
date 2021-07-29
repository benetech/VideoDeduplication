import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { useIntl } from "react-intl";
import Button from "../../../../common/components/Button";
import PresetType from "../../../../prop-types/PresetType";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "presets.deletePreset.title" }),
    description: (name) =>
      intl.formatMessage({ id: "presets.deletePreset.description" }, { name }),
    delete: intl.formatMessage({ id: "actions.delete" }),
    cancel: intl.formatMessage({ id: "actions.cancel" }),
  };
}

function DeletePresetDialog(props) {
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

DeletePresetDialog.propTypes = {
  /**
   * Preset being deleted.
   */
  preset: PresetType.isRequired,
  /**
   * Controls dialog visibility.
   */
  open: PropTypes.bool.isRequired,
  /**
   * Handle dialog close.
   */
  onClose: PropTypes.func.isRequired,
  /**
   * Handle attempt to delete preset.
   */
  onDelete: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default DeletePresetDialog;
