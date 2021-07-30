import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileSummary from "../../../components/files/FileSummary/FileSummary";
import Distance from "../../../components/basic/Distance";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import usePopup from "../../../lib/hooks/usePopup";
import { Menu, MenuItem } from "@material-ui/core";
import { useIntl } from "react-intl";
import useConfirmDialog from "./useConfirmDialog";
import FileMatchType from "../../../prop-types/FileMatchType";
import DismissedIcon from "@material-ui/icons/NotInterested";

const useStyles = makeStyles((theme) => ({
  header: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    padding: theme.spacing(2),
  },
  name: {
    paddingBottom: theme.spacing(2),
  },
  distance: {
    minWidth: 150,
  },
  button: {
    marginLeft: -theme.spacing(5),
  },
}));

/**
 * Get translated text
 */
function useMessages() {
  const intl = useIntl();
  return {
    restore: intl.formatMessage({ id: "actions.restore" }),
    dismiss: intl.formatMessage({ id: "match.delete" }),
    description: intl.formatMessage({ id: "match.delete.confirm" }),
    confirm: intl.formatMessage({ id: "match.delete.short" }),
  };
}

function menuAction(popup, handler) {
  return () => {
    popup.onClose();
    handler();
  };
}

function FileMatchHeader(props) {
  const { match, onDismiss, onRestore, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { clickTrigger, popup } = usePopup("match-menu");

  const [dialog, handleDismiss] = useConfirmDialog(
    messages.dismiss,
    messages.description,
    messages.confirm,
    () => onDismiss(match),
    [onDismiss, match]
  );

  const handleRestore = useCallback(() => onRestore(match), [onRestore, match]);

  const nameStyle = match.falsePositive
    ? { color: "secondary", icon: DismissedIcon }
    : {};

  return (
    <div className={clsx(classes.header, className)} {...other}>
      <FileSummary file={match.file} className={classes.name}>
        <FileSummary.Name {...nameStyle} />
        <Distance value={match.distance} dense className={classes.distance} />
        <IconButton className={classes.button} size="small" {...clickTrigger}>
          <MoreVertIcon />
        </IconButton>
      </FileSummary>
      <FileSummary file={match.file} divider>
        <FileSummary.Fingerprint />
        <FileSummary.Duration />
        <FileSummary.CreationDate />
      </FileSummary>
      <Menu {...popup}>
        {!match.falsePositive && (
          <MenuItem onClick={menuAction(popup, handleDismiss)}>
            {messages.dismiss}
          </MenuItem>
        )}
        {match.falsePositive && (
          <MenuItem onClick={menuAction(popup, handleRestore)}>
            {messages.restore}
          </MenuItem>
        )}
      </Menu>
      {dialog}
    </div>
  );
}

FileMatchHeader.propTypes = {
  /**
   * Match that will be summarized.
   */
  match: FileMatchType.isRequired,
  /**
   * Handle match dismissal
   */
  onDismiss: PropTypes.func.isRequired,
  /**
   * Handle match dismissal
   */
  onRestore: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default FileMatchHeader;
