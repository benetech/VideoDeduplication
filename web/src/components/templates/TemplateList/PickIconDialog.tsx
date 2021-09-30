import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Dialog, DialogActions, DialogContent, Theme } from "@material-ui/core";
import { DefaultTemplateIcon, TemplateIcon } from "../../../model/Template";
import { useIntl } from "react-intl";
import IconPicker from "../IconPicker";
import Button from "../../basic/Button";

const useStyles = makeStyles<Theme>((theme) => ({
  content: {
    marginTop: -theme.spacing(2),
  },
}));
/**
 * Get translated text.
 * @returns {{dialogTitle: string}}
 */

function useMessages() {
  const intl = useIntl();
  return {
    done: intl.formatMessage({
      id: "actions.done",
    }),
    cancel: intl.formatMessage({
      id: "actions.cancel",
    }),
  };
}

function PickIconDialog(props: PickIconDialogProps): JSX.Element {
  const { open, onClose, icon, onChange, onDone, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={clsx(className)}
      {...other}
    >
      <DialogContent>
        <IconPicker
          icon={icon || DefaultTemplateIcon}
          onChange={onChange}
          className={classes.content}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onDone} color="primary">
          {messages.done}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          {messages.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type PickIconDialogProps = {
  open: boolean;
  onClose: (...args: any[]) => void;
  onDone: (...args: any[]) => void;
  icon?: TemplateIcon;
  onChange: (...args: any[]) => void;
  className?: string;
};
export default PickIconDialog;
