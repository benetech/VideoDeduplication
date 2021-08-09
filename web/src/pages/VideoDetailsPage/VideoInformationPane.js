import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../prop-types/FileType";
import Paper from "@material-ui/core/Paper";
import { useIntl } from "react-intl";
import VideoInformation from "./VideoInformation";

const useStyles = makeStyles({
  root: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    height: "100%",
  },
  info: {
    height: "100%",
  },
});

function useMessages() {
  const intl = useIntl();
  return {
    ariaLabel: intl.formatMessage({ id: "aria.label.fileAttributesRegion" }),
  };
}

function VideoInformationPane(props) {
  const { file, onJump, className } = props;
  const classes = useStyles();
  const messages = useMessages();

  return (
    <Paper
      className={clsx(classes.root, className)}
      role="region"
      aria-label={messages.ariaLabel}
    >
      <VideoInformation file={file} onJump={onJump} className={classes.info} />
    </Paper>
  );
}

VideoInformationPane.propTypes = {
  /**
   * Video file
   */
  file: FileType.isRequired,
  /**
   * Jump to a particular object
   */
  onJump: PropTypes.func,
  className: PropTypes.string,
};

export default VideoInformationPane;
