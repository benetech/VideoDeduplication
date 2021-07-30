import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import { TemplateExampleType } from "../../../prop-types/TemplateType";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import Button from "../../../components/basic/Button";

const useStyles = makeStyles((theme) => ({
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "min-content",
  },
  preview: {
    width: 200,
    height: 200,
    margin: theme.spacing(2),
    marginTop: 0,
    objectFit: "cover",
    borderRadius: theme.spacing(1),
  },
  confirm: {
    textAlign: "center",
  },
}));

/**
 * Get translated text
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "templates.deleteExample" }),
    confirm: intl.formatMessage({ id: "templates.deleteExample.confirm" }),
    delete: intl.formatMessage({ id: "actions.delete" }),
    cancel: intl.formatMessage({ id: "actions.cancel" }),
  };
}

function DeleteExampleDialog(props) {
  const { example, onDelete, open, onClose, className, ...other } = props;
  const messages = useMessages();
  const classes = useStyles();

  const handleDelete = useCallback(() => {
    onClose();
    onDelete(example);
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={clsx(className)}
      {...other}
    >
      <DialogTitle>{messages.title}</DialogTitle>
      <DialogContent className={classes.content}>
        <img src={example.url} alt={example.id} className={classes.preview} />
        <div className={classes.confirm}>{messages.confirm}</div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete} variant="contained" color="primary">
          {messages.delete}
        </Button>
        <Button onClick={onClose} variant="outlined">
          {messages.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DeleteExampleDialog.propTypes = {
  /**
   * Example to be deleted.
   */
  example: TemplateExampleType.isRequired,
  /**
   * Controls dialog visibility.
   */
  open: PropTypes.bool.isRequired,
  /**
   * Handle dialog close.
   */
  onClose: PropTypes.func.isRequired,
  /**
   * Handle example deletion.
   */
  onDelete: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default DeleteExampleDialog;
