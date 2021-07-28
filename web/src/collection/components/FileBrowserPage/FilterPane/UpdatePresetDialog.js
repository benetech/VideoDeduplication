import React, { useCallback, useEffect, useState } from "react";
import lodash from "lodash";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  TextField,
} from "@material-ui/core";
import { useIntl } from "react-intl";
import Button from "../../../../common/components/Button";
import { useSelector } from "react-redux";
import { selectFileFilters } from "../../../../application/state/root/selectors";
import { ValidationError } from "../../../../server-api/Server/ServerError";
import nameErrorMessage from "../../TemplatesPage/nameErrorMessage";
import PresetType from "../../../prop-types/PresetType";
import PresetAPI from "./PresetAPI";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "presets.updatePreset.title" }),
    description: intl.formatMessage({ id: "presets.updatePreset.description" }),
    updateFilters: intl.formatMessage({ id: "presets.updatePreset.filters" }),
    update: intl.formatMessage({ id: "actions.update" }),
    cancel: intl.formatMessage({ id: "actions.cancel" }),
    name: intl.formatMessage({ id: "presets.name" }),
    nameError: (code) => nameErrorMessage(intl, code),
  };
}

function UpdatePresetDialog(props) {
  const { preset, onUpdate, open, onClose, className, ...other } = props;
  const messages = useMessages();
  const currentFilters = useSelector(selectFileFilters);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(preset.name);
  const [nameError, setNameError] = useState("");
  const [updateFilters, setUpdateFilters] = useState(false);

  const handleNameChange = useCallback((event) => {
    setNameError("");
    setName(event.target.value);
  });

  const handleUpdateFiltersChange = useCallback((event) =>
    setUpdateFilters(event.target.checked)
  );

  const handleUpdate = useCallback(async () => {
    setLoading(true);
    try {
      const updatedPreset = { id: preset.id };
      if (name !== preset.name) {
        updatedPreset.name = name;
      }
      if (updateFilters) {
        updatedPreset.filters = currentFilters;
      }
      await onUpdate(updatedPreset, preset);
      onClose();
    } catch (error) {
      if (error instanceof ValidationError) {
        setNameError(messages.nameError(error.fields.name));
      } else {
        console.error("Error creating preset", { error });
      }
    } finally {
      setLoading(false);
    }
  }, [name, currentFilters, onUpdate, onClose, updateFilters, preset]);

  // Reset dialog state on open or preset change
  useEffect(() => {
    if (open) {
      setLoading(false);
      setName(preset.name);
      setNameError("");
      setUpdateFilters(false);
    }
  }, [open, preset]);

  // Check filers could be updated
  const canUpdateFilters = !lodash.isEqual(
    currentFilters,
    PresetAPI.DefaultFilters
  );

  // Check if the update is possible
  const canUpdate =
    !!name && !nameError && !loading && (name !== preset.name || updateFilters);

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
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={updateFilters}
              onChange={handleUpdateFiltersChange}
              disabled={!canUpdateFilters || loading}
            />
          }
          label={messages.updateFilters}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          disabled={!canUpdate}
        >
          {messages.update}
        </Button>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          {messages.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

UpdatePresetDialog.propTypes = {
  /**
   * Preset being updated.
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
   * Handle attempt to update preset.
   */
  onUpdate: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default UpdatePresetDialog;
