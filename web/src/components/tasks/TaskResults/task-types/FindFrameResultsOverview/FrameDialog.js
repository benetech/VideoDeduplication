import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { Dialog } from "@material-ui/core";
import useFile from "../../../../../application/api/files/useFile";
import FrameView from "../../../../files/FrameView/FrameView";
import FrameMatchType from "./FrameMatchType";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  noScroll: {
    overflowY: "hidden",
  },
});

function FrameDialog(props) {
  const { match, className, ...other } = props;
  const { file } = useFile(match.fileId);
  const classes = useStyles();

  if (file == null) {
    return null;
  }

  return (
    <Dialog
      className={clsx(className)}
      classes={{ paperScrollPaper: classes.noScroll }}
      {...other}
    >
      <FrameView file={file} timeMillis={match.startMs} />
    </Dialog>
  );
}

FrameDialog.propTypes = {
  /**
   * Frame match that will be displayed.
   */
  match: FrameMatchType.isRequired,
  /**
   * If `true`, the Dialog is open.
   */
  open: PropTypes.bool,
  /**
   * Callback fired when the component requests to be closed.
   *
   * @param {object} event The event source of the callback.
   * @param {string} reason Can be: `"escapeKeyDown"`, `"backdropClick"`.
   */
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default FrameDialog;
