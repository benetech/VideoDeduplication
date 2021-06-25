import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../../prop-types/FileType";
import Paper from "@material-ui/core/Paper";
import CollapseButton from "../../../../common/components/CollapseButton";
import { useIntl } from "react-intl";
import Collapse from "@material-ui/core/Collapse";
import VideoInformation from "../../VideoDetailsPage/VideoInformation";

const useStyles = makeStyles((theme) => ({
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
  title: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    flexGrow: 1,
  },
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
    title: intl.formatMessage({ id: "file.details" }),
  };
}

function FileDescriptionPane(props) {
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

FileDescriptionPane.propTypes = {
  /**
   * Video file
   */
  file: FileType.isRequired,
  /**
   * Jump to a particular object
   */
  onJump: PropTypes.func,
  /**
   * Enable or disable pane collapse feature.
   */
  collapsible: PropTypes.bool,
  className: PropTypes.string,
};

export default FileDescriptionPane;
