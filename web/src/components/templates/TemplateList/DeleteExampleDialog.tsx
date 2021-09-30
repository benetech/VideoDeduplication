import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
} from "@material-ui/core";
import { useIntl } from "react-intl";
import { TemplateExample } from "../../../model/Template";
import Button from "../../basic/Button";

const useStyles = makeStyles<Theme>((theme) => ({
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
    title: intl.formatMessage({
      id: "templates.deleteExample",
    }),
    confirm: intl.formatMessage({
      id: "templates.deleteExample.confirm",
    }),
    delete: intl.formatMessage({
      id: "actions.delete",
    }),
    cancel: intl.formatMessage({
      id: "actions.cancel",
    }),
  };
}

function DeleteExampleDialog(props: DeleteExampleDialogProps): JSX.Element {
  const { example, onDelete, open, onClose, className, ...other } = props;
  const messages = useMessages();
  const classes = useStyles();
  const handleDelete = useCallback(() => {
    onClose();
    onDelete(example);
  }, []);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={clsx(className)}
      {...other}
    >
      <DialogTitle>{messages.title}</DialogTitle>
      <DialogContent className={classes.content}>
        <img
          src={example.url}
          alt={`${example.id}`}
          className={classes.preview}
        />
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

type DeleteExampleDialogProps = {
  /**
   * Example to be deleted.
   */
  example: TemplateExample;

  /**
   * Controls dialog visibility.
   */
  open: boolean;

  /**
   * Handle dialog close.
   */
  onClose: (...args: any[]) => void;

  /**
   * Handle example deletion.
   */
  onDelete: (...args: any[]) => void;
  className?: string;
};
export default DeleteExampleDialog;
