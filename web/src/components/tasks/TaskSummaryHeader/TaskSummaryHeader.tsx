import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Paper, Theme } from "@material-ui/core";
import { Task, TaskStatus } from "../../../model/Task";
import TaskSummary from "../TaskSummary";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import MoreVertOutlinedIcon from "@material-ui/icons/MoreVertOutlined";
import IconButton from "@material-ui/core/IconButton";
import { useIntl } from "react-intl";
import usePopup from "../../../lib/hooks/usePopup";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import useCancelTask from "../../../application/api/tasks/useCancelTask";
import useDeleteTask from "../../../application/api/tasks/useDeleteTask";
import { useShowProcessing } from "../../../routing/hooks";

const useStyles = makeStyles<Theme>((theme) => ({
  header: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  summary: {
    flexGrow: 1,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    minWidth: 0,
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    goBack: intl.formatMessage({
      id: "actions.goBack",
    }),
    delete: intl.formatMessage({
      id: "actions.delete",
    }),
    cancel: intl.formatMessage({
      id: "actions.cancel",
    }),
  };
}
/**
 * Check if task is still active.
 */

function isActiveTask(task: Task): boolean {
  const status = task.status;
  return status === TaskStatus.PENDING || status === TaskStatus.RUNNING;
}

function TaskSummaryHeader(props: TaskSummaryHeaderProps): JSX.Element {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const isActive = isActiveTask(task);
  const { clickTrigger, popup } = usePopup<HTMLButtonElement>("task-menu-");
  const handleBack = useShowProcessing();
  const deleteTask = useDeleteTask();
  const cancelTask = useCancelTask();
  const handleCancel = useCallback(() => {
    popup.onClose();
    cancelTask(task).catch(console.error);
  }, [task]);
  const handleDelete = useCallback(async () => {
    try {
      popup.onClose();
      await deleteTask(task);
      handleBack();
    } catch (error) {
      console.log(error);
    }
  }, [task]);
  return (
    <Paper className={clsx(classes.header, className)} {...other}>
      <TaskSummary task={task} className={classes.summary}>
        <IconButton onClick={handleBack} aria-label={messages.goBack}>
          <ArrowBackOutlinedIcon />
        </IconButton>
        <TaskSummary.StatusIcon />
        <TaskSummary.Description />
        <TaskSummary.Progress />
        <TaskSummary.Status />
        <IconButton {...clickTrigger}>
          <MoreVertOutlinedIcon />
        </IconButton>
      </TaskSummary>
      <Menu {...popup}>
        {isActive && (
          <MenuItem onClick={handleCancel}>{messages.cancel}</MenuItem>
        )}
        <MenuItem onClick={handleDelete}>{messages.delete}</MenuItem>
      </Menu>
    </Paper>
  );
}

type TaskSummaryHeaderProps = {
  /**
   * Background task which will be summarized.
   */
  task: Task;
  className?: string;
};
export default TaskSummaryHeader;
