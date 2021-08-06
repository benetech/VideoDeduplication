import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../prop-types/TaskType";
import TaskStatus from "../../../application/state/tasks/TaskStatus";
import HeightOutlinedIcon from "@material-ui/icons/HeightOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import { formatDistance } from "date-fns";
import { IconButton } from "@material-ui/core";
import { useIntl } from "react-intl";
import TaskProgress from "./TaskProgress";
import usePopup from "../../../lib/hooks/usePopup";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { routes } from "../../../routing/routes";
import { useHistory } from "react-router";
import getStatusIcon from "../TaskSummary/helpers/getStatusIcon";
import useCancelTask from "../../../application/api/tasks/useCancelTask";
import useDeleteTask from "../../../application/api/tasks/useDeleteTask";
import getTaskTextDescription from "../TaskSummary/helpers/getTaskTextDescription";

const useStyles = makeStyles((theme) => ({
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
    delete: intl.formatMessage({ id: "actions.delete" }),
    cancel: intl.formatMessage({ id: "actions.cancel" }),
    showLogs: intl.formatMessage({ id: "actions.showLogs" }),
    dataset: intl.formatMessage({ id: "task.type.all" }),
    templates: intl.formatMessage({ id: "task.type.templates" }),
    findFrame: intl.formatMessage({ id: "actions.findFrame" }),
    files(count) {
      const files = intl.formatMessage({
        id: count === 1 ? "file.one" : "file.many",
      });
      return `${count} ${files}`;
    },
    time(task) {
      return intl.formatMessage(
        { id: "task.time" },
        { time: formatDistance(task.submissionTime, new Date()) }
      );
    },
    status(task) {
      switch (task.status) {
        case TaskStatus.PENDING:
          return intl.formatMessage({ id: "task.status.pending" });
        case TaskStatus.RUNNING:
          return intl.formatMessage({ id: "task.status.running" });
        case TaskStatus.SUCCESS:
          return intl.formatMessage({ id: "task.status.success" });
        case TaskStatus.FAILURE:
          return intl.formatMessage({ id: "task.status.failure" });
        case TaskStatus.CANCELLED:
          return intl.formatMessage({ id: "task.status.cancelled" });
        default:
          console.warn(`Unsupported task status: ${task.status}`);
          return task.status;
      }
    },
  };
}

function TaskListItem(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const description = getTaskTextDescription(task.request, messages.intl);
  const Icon = getStatusIcon(task.status);
  const running = task.status === TaskStatus.RUNNING;
  const { clickTrigger, popup } = usePopup("task-menu-");
  const history = useHistory();

  const handleShowLogs = useCallback(
    () => history.push(routes.processing.taskLogsURL(task.id)),
    [task.id]
  );

  const handleExpand = useCallback(
    () => history.push(routes.processing.taskURL(task.id)),
    [task.id]
  );

  const handleCancel = useCancelTask({
    id: task.id,
    onTrigger: () => popup.onClose(),
  });
  const handleDelete = useDeleteTask({
    id: task.id,
    onTrigger: () => popup.onClose(),
  });

  return (
    <div className={clsx(classes.task, className)} {...other}>
      <div className={classes.attributesArea}>
        <Icon className={classes.icon} />
        <div className={classes.attributes}>
          <div className={classes.topAttributes}>
            <div className={classes.timeCaption}>{messages.time(task)}</div>
            <IconButton size="small" onClick={handleExpand}>
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

TaskListItem.propTypes = {
  /**
   * Status that will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default TaskListItem;
