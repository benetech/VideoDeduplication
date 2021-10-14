import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { VideoFile } from "../../../model/VideoFile";
import Paper from "@material-ui/core/Paper";
import CollapseButton from "../../../components/basic/CollapseButton";
import { useIntl } from "react-intl";
import Collapse from "@material-ui/core/Collapse";
import VideoInformation from "../../VideoDetailsPage/VideoInformation";
import { TemplateMatch } from "../../../model/Template";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  header: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  title: { ...theme.mixins.title3, fontWeight: "bold", flexGrow: 1 },
  collapseButton: {
    flexGrow: 0,
  },
}));
/**
 * Get i18n text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({
      id: "file.details",
    }),
  };
}

function FileDescriptionPane(props: FileDescriptionPaneProps): JSX.Element {
  const { file, onJump, collapsible, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [collapsed, setCollapsed] = useState(false);
  const handleCollapse = useCallback(
    () => setCollapsed(!collapsed),
    [collapsed]
  );
  return (
    <Paper className={clsx(classes.root, className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{messages.title}</div>
        {collapsible && (
          <CollapseButton
            collapsed={collapsed}
            onClick={handleCollapse}
            size="small"
          />
        )}
      </div>
      <Collapse in={!collapsed}>
        <VideoInformation file={file} onJump={onJump} />
      </Collapse>
    </Paper>
  );
}

type FileDescriptionPaneProps = {
  /**
   * Video file
   */
  file: VideoFile;

  /**
   * Jump to a particular object
   */
  onJump: (object: TemplateMatch) => void;

  /**
   * Enable or disable pane collapse feature.
   */
  collapsible?: boolean;
  className?: string;
};
export default FileDescriptionPane;
