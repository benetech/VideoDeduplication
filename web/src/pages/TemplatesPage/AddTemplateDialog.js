import React, { useCallback, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { useIntl } from "react-intl";
import Button from "../../components/basic/Button";
import useNewTemplateForm from "../../components/templates/NewTemplateForm/useNewTemplateForm";
import NewTemplateForm from "../../components/templates/NewTemplateForm";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "actions.addTemplate" }),
    cancel: intl.formatMessage({ id: "actions.cancel" }),
    create: intl.formatMessage({ id: "actions.create" }),
  };
}

function AddTemplateDialog(props) {
  const { open, onClose, className, ...other } = props;
  const messages = useMessages();

  const form = useNewTemplateForm();

  // Reset dialog state on open
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open]);

  const handleCreate = useCallback(async () => {
    try {
      await form.onCreate();
      onClose();
    } catch (error) {
      console.error(error);
    }
  }, [form.onCreate]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={clsx(className)}
      {...other}
    >
      <DialogTitle>{messages.title}</DialogTitle>
      <DialogContent>
        <NewTemplateForm
          template={form.template}
          onChange={form.onChange}
          errors={form.errors}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          disabled={!form.template.name || form.isLoading || !!form.errors.name}
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
