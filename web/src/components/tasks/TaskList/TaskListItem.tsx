import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { IconButton, Theme } from "@material-ui/core";
import { Task, TaskStatus } from "../../../model/Task";
import HeightOutlinedIcon from "@material-ui/icons/HeightOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import { formatDistance } from "date-fns";
import { useIntl } from "react-intl";
import TaskProgress from "./TaskProgress";
import usePopup from "../../../lib/hooks/usePopup";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import getStatusIcon from "../TaskSummary/helpers/getStatusIcon";
import useCancelTask from "../../../application/api/tasks/useCancelTask";
import useDeleteTask from "../../../application/api/tasks/useDeleteTask";
import getTaskTextDescription from "../TaskSummary/helpers/getTaskTextDescription";
import { useShowLogs, useShowTask } from "../../../routing/hooks";
import formatTaskStatus from "../../../lib/messages/formatTaskStatus";

const useStyles = makeStyles<Theme>((theme) => ({
  task: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
    marginBottom: theme.spacing(1),
  },
  attributesArea: {
    display: "flex",
    alignItems: "flex-end",
    marginBottom: theme.spacing(1),
  },
  icon: {
    marginRight: theme.spacing(2),
    fontSize: 15,
  },
  attributes: {
    flexGrow: 1,
  },
  topAttributes: {
    display: "flex",
    alignItems: "center",
  },
  timeCaption: {
    flexGrow: 1,
    ...theme.mixins.captionText,
  },
  expandIcon: {
    transform: "rotate(45deg)",
  },
  descriptionContainer: {
    display: "flex",
    alignItems: "flex-end",
  },
  description: {
    ...theme.mixins.title5,
    ...theme.mixins.textEllipsis,
    fontWeight: "bold",
    flexGrow: 1,
    flexShrink: 1,
  },
  status: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    ...theme.mixins.captionText,
  },
  progress: {
    margin: theme.spacing(1),
  },
}));

function useMessages() {
  const intl = useIntl();
  return {
    intl,
    delete: intl.formatMessage({
      id: "actions.delete",
    }),
    cancel: intl.formatMessage({
      id: "actions.cancel",
    }),
    showLogs: intl.formatMessage({
      id: "actions.showLogs",
    }),
    dataset: intl.formatMessage({
      id: "task.type.all",
    }),
    templates: intl.formatMessage({
      id: "task.type.templates",
    }),
    findFrame: intl.formatMessage({
      id: "actions.findFrame",
    }),

    files(count: number) {
      const files = intl.formatMessage({
        id: count === 1 ? "file.one" : "file.many",
      });
      return `${count} ${files}`;
    },

    time(task: Task) {
      return intl.formatMessage(
        {
          id: "task.time",
        },
        {
          time: formatDistance(task.submissionTime, new Date()),
        }
      );
    },

    status(task: Task) {
      return formatTaskStatus(task.status, intl);
    },
  };
}

function TaskListItem(props: TaskListItemProps): JSX.Element {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const description = getTaskTextDescription(task.request, messages.intl);
  const Icon = getStatusIcon(task.status);
  const running = task.status === TaskStatus.RUNNING;
  const { clickTrigger, popup } = usePopup<HTMLButtonElement>("task-menu-");
  const deleteTask = useDeleteTask();
  const cancelTask = useCancelTask();
  const showLogs = useShowLogs();
  const showTask = useShowTask();
  const handleShowLogs = useCallback(() => showLogs(task), [task]);
  const handleShowTask = useCallback(() => showTask(task), [task]);
  const handleCancel = useCallback(() => {
    popup.onClose();
    cancelTask(task).catch(console.error);
  }, [task]);
  const handleDelete = useCallback(() => {
    popup.onClose();
    deleteTask(task).catch(console.error);
  }, [task]);
  return (
    <div className={clsx(classes.task, className)} {...other}>
      <div className={classes.attributesArea}>
        <Icon className={classes.icon} />
        <div className={classes.attributes}>
          <div className={classes.topAttributes}>
            <div className={classes.timeCaption}>{messages.time(task)}</div>
            <IconButton size="small" onClick={handleShowTask}>
              <HeightOutlinedIcon
                className={classes.expandIcon}
                fontSize="small"
              />
            </IconButton>
            <IconButton size="small" {...clickTrigger}>
              <MoreHorizOutlinedIcon fontSize="small" />
            </IconButton>
          </div>
          <div className={classes.descriptionContainer}>
            <div className={classes.description}>{description}</div>
            <div className={classes.status}>{messages.status(task)}</div>
          </div>
        </div>
      </div>
      {running && (
        <TaskProgress value={task.progress} className={classes.progress} />
      )}
      <Menu {...popup}>
        <MenuItem onClick={handleShowLogs}>{messages.showLogs}</MenuItem>
        <MenuItem onClick={handleCancel}>{messages.cancel}</MenuItem>
        <MenuItem onClick={handleDelete}>{messages.delete}</MenuItem>
      </Menu>
    </div>
  );
}

type TaskListItemProps = {
  /**
   * Status that will be displayed.
   */
  task: Task;
  className?: string;
};
export default TaskListItem;
