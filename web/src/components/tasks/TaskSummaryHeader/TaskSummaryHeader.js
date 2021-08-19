import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../prop-types/TaskType";
import TaskSummary from "../TaskSummary";
import { Paper } from "@material-ui/core";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import MoreVertOutlinedIcon from "@material-ui/icons/MoreVertOutlined";
import IconButton from "@material-ui/core/IconButton";
import { useIntl } from "react-intl";
import usePopup from "../../../lib/hooks/usePopup";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import TaskStatus from "../../../prop-types/TaskStatus";
import useCancelTask from "../../../application/api/tasks/useCancelTask";
import useDeleteTask from "../../../application/api/tasks/useDeleteTask";
import { useShowProcessing } from "../../../routing/hooks";

const useStyles = makeStyles((theme) => ({
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
    goBack: intl.formatMessage({ id: "actions.goBack" }),
    delete: intl.formatMessage({ id: "actions.delete" }),
    cancel: intl.formatMessage({ id: "actions.cancel" }),
  };
}

/**
 * Check if task is still active.
 */
function isActiveTask(task) {
  const status = task.status;
  return status === TaskStatus.PENDING || status === TaskStatus.RUNNING;
}

function TaskSummaryHeader(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const isActive = isActiveTask(task);
  const { clickTrigger, popup } = usePopup("task-menu-");
  const handleBack = useShowProcessing();
  const deleteTask = useDeleteTask(task, [task]);
  const cancelTask = useCancelTask(task, [task]);

  const handleCancel = useCallback(() => {
    popup.onClose();
    cancelTask().catch(console.error);
  }, [cancelTask]);

  const handleDelete = useCallback(async () => {
    try {
      popup.onClose();
      await deleteTask();
      handleBack();
    } catch (error) {
      console.log(error);
    }
  }, [deleteTask]);

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

TaskSummaryHeader.propTypes = {
  /**
   * Background task which will be summarized.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default TaskSummaryHeader;
