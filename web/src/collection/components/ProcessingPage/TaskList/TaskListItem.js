import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../prop-types/TaskType";
import TaskStatus from "../../../state/tasks/TaskStatus";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import CheckOutlinedIcon from "@material-ui/icons/CheckOutlined";
import BlockOutlinedIcon from "@material-ui/icons/BlockOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import PlayCircleFilledWhiteOutlinedIcon from "@material-ui/icons/PlayCircleFilledWhiteOutlined";
import HeightOutlinedIcon from "@material-ui/icons/HeightOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import { formatDistance } from "date-fns";
import { IconButton } from "@material-ui/core";
import TaskRequest from "../../../state/tasks/TaskRequest";
import { useIntl } from "react-intl";
import TaskProgress from "./TaskProgress";
import usePopup from "../../../../common/hooks/usePopup";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { useServer } from "../../../../server-api/context";
import { useDispatch } from "react-redux";
import { deleteTask, updateTask } from "../../../state/tasks/actions";

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

function getStatusIcon(status) {
  switch (status) {
    case TaskStatus.PENDING:
      return ScheduleOutlinedIcon;
    case TaskStatus.RUNNING:
      return PlayCircleFilledWhiteOutlinedIcon;
    case TaskStatus.SUCCESS:
      return CheckOutlinedIcon;
    case TaskStatus.FAILURE:
      return CloseOutlinedIcon;
    case TaskStatus.CANCELLED:
      return BlockOutlinedIcon;
    default:
      console.warn(`Unsupported task status: ${status}`);
      return HelpOutlineOutlinedIcon;
  }
}

function useMessages() {
  const intl = useIntl();
  return {
    delete: intl.formatMessage({ id: "actions.delete" }),
    cancel: intl.formatMessage({ id: "actions.cancel" }),
    showLogs: intl.formatMessage({ id: "actions.showLogs" }),
    dataset: intl.formatMessage({ id: "task.type.all" }),
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

function getTextDescription(request, messages) {
  switch (request.type) {
    case TaskRequest.DIRECTORY:
      if (request.directory === ".") {
        return messages.dataset;
      } else {
        return request.directory;
      }
    case TaskRequest.FILE_LIST:
      return messages.files(request.files.length);
    default:
      console.warn(`Unsupported task request type: ${request.type}`);
      return request.type;
  }
}

function TaskListItem(props) {
  const { task, className, ...other } = props;
  const server = useServer();
  const classes = useStyles();
  const messages = useMessages();
  const dispatch = useDispatch();
  const description = getTextDescription(task.request, messages);
  const Icon = getStatusIcon(task.status);
  const running = task.status === TaskStatus.RUNNING;
  const { clickTrigger, popup } = usePopup("task-menu-");

  const handleCancel = useCallback(() => {
    popup.onClose();
    server.cancelTask({ id: task.id }).then((response) => {
      if (response.success) {
        dispatch(updateTask(response.data));
      } else {
        console.error(`Error cancel task: ${task.id}`, response.error);
      }
    });
  }, [task.id]);

  const handleDelete = useCallback(() => {
    popup.onClose();
    server.deleteTask({ id: task.id }).then((response) => {
      if (response.success) {
        dispatch(deleteTask(task.id));
      } else {
        console.log(`Error delete task: ${task.id}`, response.error);
      }
    });
  }, [task.id]);

  return (
    <div className={clsx(classes.task, className)} {...other}>
      <div className={classes.attributesArea}>
        <Icon className={classes.icon} />
        <div className={classes.attributes}>
          <div className={classes.topAttributes}>
            <div className={classes.timeCaption}>{messages.time(task)}</div>
            <IconButton size="small">
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
        <MenuItem onClick={popup.onClose}>{messages.showLogs}</MenuItem>
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
