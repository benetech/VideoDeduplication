import React from "react";
import clsx from "clsx";
import { Dialog, Theme } from "@material-ui/core";
import useFile from "../../../../../application/api/files/useFile";
import FrameView from "../../../../files/FrameView/FrameView";
import { makeStyles } from "@material-ui/styles";
import { FoundFrame } from "../../../../../model/Task";
import { DialogProps } from "@material-ui/core/Dialog/Dialog";

const useStyles = makeStyles<Theme>({
  noScroll: {
    overflowY: "hidden",
  },
});

function FrameDialog(props: FrameDialogProps): JSX.Element | null {
  const { match, className, ...other } = props;
  const { file } = useFile(match.fileId);
  const classes = useStyles();

  if (file == null) {
    return null;
  }

  return (
    <Dialog
      className={clsx(className)}
      classes={{
        paperScrollPaper: classes.noScroll,
      }}
      {...other}
    >
      <FrameView file={file} timeMillis={match.startMs} />
    </Dialog>
  );
}

type FrameDialogProps = DialogProps & {
  /**
   * Frame match that will be displayed.
   */
  match: FoundFrame;

  /**
   * If `true`, the Dialog is open.
   */
  open?: boolean;

  /**
   * Callback fired when the component requests to be closed.
   *
   * @param {object} event The event source of the callback.
   * @param {string} reason Can be: `"escapeKeyDown"`, `"backdropClick"`.
   */
  onClose: (...args: any[]) => void;
  className?: string;
};
export default FrameDialog;
