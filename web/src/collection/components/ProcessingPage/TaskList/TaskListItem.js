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
import PlayCircleFilledWhiteOutlinedIcon from "@material-ui/icons/PlayCircleFilledWhiteOutlined";
import HeightOutlinedIcon from "@material-ui/icons/HeightOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import { formatDistance } from "date-fns";
import { IconButton } from "@material-ui/core";
import TaskRequest from "../../../state/tasks/TaskRequest";
import { useIntl } from "react-intl";
import TaskProgress from "./TaskProgress";
import usePopup from "../../../../common/hooks/usePopup";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

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
    time(task) {
      return intl.formatMessage(
        { id: "task.time" },
        { time: formatDistance(task.statusUpdateTime, new Date()) }
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
          throw new Error(`Unsupported task status: ${task.status}`);
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
        return request.directoryPath;
      }
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
  const { clickTrigger, popup } = usePopup("task-menu-");

  return (
    <div className={clsx(classes.task, className)} {...other}>
      <div className={classes.attributesArea}>
        <Icon fontSize="small" className={classes.icon} />
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
        <MenuItem>Show Logs</MenuItem>
        <MenuItem>Cancel</MenuItem>
        <MenuItem>Delete</MenuItem>
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
