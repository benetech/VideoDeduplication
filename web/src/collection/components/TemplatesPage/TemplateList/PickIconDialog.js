import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { TemplateIconType } from "../../../prop-types/TemplateType";
import { Dialog, DialogActions, DialogContent } from "@material-ui/core";
import { useIntl } from "react-intl";
import IconPicker from "../IconPicker";
import Button from "../../../../common/components/Button";

const useStyles = makeStyles((theme) => ({
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
    done: intl.formatMessage({ id: "actions.done" }),
    cancel: intl.formatMessage({ id: "actions.cancel" }),
  };
}

function PickIconDialog(props) {
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
          icon={icon}
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

PickIconDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  icon: TemplateIconType,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default PickIconDialog;
