import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { IconButton, Theme, Tooltip } from "@material-ui/core";
import TaskSidebar from "./TaskSidebar";
import { useIntl } from "react-intl";
import Title from "../../components/basic/Title";
import Description from "./Description";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import PlaylistAddCheckOutlinedIcon from "@material-ui/icons/PlaylistAddCheckOutlined";
import Spacer from "../../components/basic/Spacer";
import TaskBuilder from "../../components/tasks/TaskBuilder";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 3,
    minWidth: theme.dimensions.collectionPage.width,
  },
  content: {
    display: "flex",
    alignItems: "stretch",
  },
  builder: {
    flexGrow: 1,
  },
  tasks: {
    marginLeft: theme.spacing(4),
    width: 380,
    flexShrink: 0,
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
    title: intl.formatMessage({
      id: "processing.title",
    }),
    showTasks: intl.formatMessage({
      id: "actions.showTasks",
    }),
    hideTasks: intl.formatMessage({
      id: "actions.hideTasks",
    }),
  };
}

function ProcessingPage(props: ProcessingPageProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [showTasks, setShowTasks] = useState(true);
  const handleToggleTasks = useCallback(
    () => setShowTasks(!showTasks),
    [showTasks]
  );
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
        <TaskBuilder className={classes.builder} />
        {showTasks && <TaskSidebar className={classes.tasks} />}
      </div>
    </div>
  );
}

type ProcessingPageProps = {
  className?: string;
};
export default ProcessingPage;
