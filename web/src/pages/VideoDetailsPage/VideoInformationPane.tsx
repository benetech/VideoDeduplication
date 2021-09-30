import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { VideoFile } from "../../model/VideoFile";
import Paper from "@material-ui/core/Paper";
import { useIntl } from "react-intl";
import VideoInformation from "./VideoInformation";
import { TemplateMatch } from "../../model/Template";

const useStyles = makeStyles<Theme>({
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
    ariaLabel: intl.formatMessage({
      id: "aria.label.fileAttributesRegion",
    }),
  };
}

function VideoInformationPane(props: VideoInformationPaneProps): JSX.Element {
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

type VideoInformationPaneProps = {
  /**
   * Video file
   */
  file: VideoFile;

  /**
   * Jump to a particular object
   */
  onJump: (object: TemplateMatch) => void;
  className?: string;
};
export default VideoInformationPane;
