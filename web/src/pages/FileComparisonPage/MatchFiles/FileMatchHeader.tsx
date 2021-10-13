import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Menu, MenuItem, Theme } from "@material-ui/core";
import FileSummary from "../../../components/files/FileSummary/FileSummary";
import Distance from "../../../components/matches/Distance";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import usePopup, { PopupOptions } from "../../../lib/hooks/usePopup";
import { useIntl } from "react-intl";
import useConfirmDialog from "./useConfirmDialog";
import { FileMatch } from "../../../model/Match";
import DismissedIcon from "@material-ui/icons/NotInterested";
import { FileNameProps } from "../../../components/files/FileSummary/Name";

const useStyles = makeStyles<Theme>((theme) => ({
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
    restore: intl.formatMessage({
      id: "actions.restore",
    }),
    dismiss: intl.formatMessage({
      id: "match.delete",
    }),
    description: intl.formatMessage({
      id: "match.delete.confirm",
    }),
    confirm: intl.formatMessage({
      id: "match.delete.short",
    }),
  };
}

function menuAction(popup: PopupOptions, handler: () => void): () => void {
  return () => {
    popup.onClose();
    handler();
  };
}

function FileMatchHeader(props: FileMatchHeaderProps): JSX.Element {
  const { match, onDismiss, onRestore, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { clickTrigger, popup } = usePopup<HTMLButtonElement>("match-menu");
  const [dialog, handleDismiss] = useConfirmDialog(
    messages.dismiss,
    messages.description,
    messages.confirm,
    () => onDismiss(match),
    [onDismiss, match]
  );
  const handleRestore = useCallback(() => onRestore(match), [onRestore, match]);
  const nameStyle: Partial<FileNameProps> = match.falsePositive
    ? {
        color: "secondary",
        icon: DismissedIcon,
      }
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

type FileMatchHeaderProps = {
  /**
   * Match that will be summarized.
   */
  match: FileMatch;

  /**
   * Handle match dismissal
   */
  onDismiss: (match: FileMatch) => void;

  /**
   * Handle match dismissal
   */
  onRestore: (match: FileMatch) => void;
  className?: string;
};
export default FileMatchHeader;
