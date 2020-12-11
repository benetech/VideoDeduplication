import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../prop-types/TaskType";
import TaskStatus from "../../../state/tasks/TaskStatus";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import CheckOutlinedIcon from "@material-ui/icons/CheckOutlined";
import BlockOutlinedIcon from "@material-ui/icons/BlockOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import PlayArrowOutlinedIcon from "@material-ui/icons/PlayArrowOutlined";
import HeightOutlinedIcon from "@material-ui/icons/HeightOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import { formatDistance } from "date-fns";
import { IconButton } from "@material-ui/core";
import TaskRequest from "../../../state/tasks/TaskRequest";
import { useIntl } from "react-intl";
import TaskProgress from "./TaskProgress";

const useStyles = makeStyles((theme) => ({
  task: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
    marginTop: theme.spacing(1),
  },
  attributesArea: {
    display: "flex",
    alignItems: "flex-end",
    marginBottom: theme.spacing(1),
  },
  icon: {
    marginRight: theme.spacing(2),
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
  description: {
    ...theme.mixins.title5,
    ...theme.mixins.textEllipsis,
    fontWeight: "bold",
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
      return PlayArrowOutlinedIcon;
    case TaskStatus.SUCCESS:
      return CheckOutlinedIcon;
    case TaskStatus.FAILURE:
      return CloseOutlinedIcon;
    case TaskStatus.CANCELLED:
      return BlockOutlinedIcon;
    default:
      throw new Error(`Unsupported task status: ${status}`);
  }
}

function useMessages() {
  const intl = useIntl();
  return {
    dataset: intl.formatMessage({ id: "task.type.all" }),
    files(count) {
      const files = intl.formatMessage({
        id: count === 1 ? "file.one" : "file.many",
      });
      return `${count} ${files}`;
    },
    status(task) {
      const time = formatDistance(task.statusUpdateTime, new Date());
      switch (task.status) {
        case TaskStatus.PENDING:
          return intl.formatMessage({ id: "task.status.pending" }, { time });
        case TaskStatus.RUNNING:
          return intl.formatMessage({ id: "task.status.running" }, { time });
        case TaskStatus.SUCCESS:
          return intl.formatMessage({ id: "task.status.success" }, { time });
        case TaskStatus.FAILURE:
          return intl.formatMessage({ id: "task.status.failure" }, { time });
        case TaskStatus.CANCELLED:
          return intl.formatMessage({ id: "task.status.cancelled" }, { time });
        default:
          throw new Error(`Unsupported task status: ${task.status}`);
      }
    },
  };
}

function getTextDescription(request, messages) {
  switch (request.type) {
    case TaskRequest.ALL:
      return messages.dataset;
    case TaskRequest.DIRECTORY:
      return request.directoryPath;
    case TaskRequest.FILE_LIST:
      return messages.files(request.files.length);
    default:
      throw new Error(`Unsupported task request type: ${request.type}`);
  }
}

function TaskListItem(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const description = getTextDescription(task.request, messages);
  const Icon = getStatusIcon(task.status);
  const running = task.status === TaskStatus.RUNNING;
  return (
    <div className={clsx(classes.task, className)} {...other}>
      <div className={classes.attributesArea}>
        <Icon className={classes.icon} />
        <div className={classes.attributes}>
          <div className={classes.topAttributes}>
            <div className={classes.timeCaption}>{messages.status(task)}</div>
            <IconButton size="small">
              <HeightOutlinedIcon
                className={classes.expandIcon}
                fontSize="small"
              />
            </IconButton>
            <IconButton size="small">
              <MoreHorizOutlinedIcon fontSize="small" />
            </IconButton>
          </div>
          <div className={classes.description}>{description}</div>
        </div>
      </div>
      {running && (
        <TaskProgress value={task.progress} className={classes.progress} />
      )}
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
