import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileSelector from "./FileSelector";
import TaskSidebar from "./TaskSidebar";
import { useIntl } from "react-intl";
import Title from "../../../common/components/Title";
import Description from "./Description";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import PlaylistAddCheckOutlinedIcon from "@material-ui/icons/PlaylistAddCheckOutlined";
import { IconButton, Tooltip } from "@material-ui/core";
import Spacer from "../../../common/components/Spacer";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 3,
    minWidth: theme.dimensions.collectionPage.width,
  },
  content: {
    display: "flex",
    alignItems: "stretch",
  },
  selector: {
    flexGrow: 1,
  },
  tasks: {
    marginLeft: theme.spacing(4),
    maxWidth: 380,
  },
  description: {
    flexGrow: 1,
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "processing.title" }),
    showTasks: intl.formatMessage({ id: "actions.showTasks" }),
    hideTasks: intl.formatMessage({ id: "actions.hideTasks" }),
  };
}

function ProcessingPage(props) {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [showTasks, setShowTasks] = useState(true);

  const handleToggleTasks = useCallback(() => setShowTasks(!showTasks), [
    showTasks,
  ]);

  const Icon = showTasks ? CloseOutlinedIcon : PlaylistAddCheckOutlinedIcon;
  const tooltip = showTasks ? messages.hideTasks : messages.showTasks;

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <Title text={messages.title}>
        <Description className={classes.description} />
        <Spacer />
        <Tooltip title={tooltip}>
          <IconButton
            color="inherit"
            onClick={handleToggleTasks}
            aria-label={tooltip}
          >
            <Icon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
      </Title>
      <div className={classes.content}>
        <FileSelector className={classes.selector} />
        {showTasks && <TaskSidebar className={classes.tasks} />}
      </div>
    </div>
  );
}

ProcessingPage.propTypes = {
  className: PropTypes.string,
};

export default ProcessingPage;
