import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../prop-types/TaskType";
import TaskStatus from "../../../state/tasks/TaskStatus";
import ScheduleOutlinedIcon from "@material-ui/icons/ScheduleOutlined";
import FastForwardOutlinedIcon from "@material-ui/icons/FastForwardOutlined";
import CheckOutlinedIcon from "@material-ui/icons/CheckOutlined";
import BlockOutlinedIcon from "@material-ui/icons/BlockOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import PlayArrowOutlinedIcon from "@material-ui/icons/PlayArrowOutlined";

const useStyles = makeStyles((theme) => ({
  task: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
    marginTop: theme.spacing(1),
  },
  attributeArea: {
    display: "flex",
    alignItems: "flex-end",
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

function TaskListItem(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const Icon = getStatusIcon(task.status);
  return (
    <div className={clsx(classes.task, className)} {...other}>
      <div className={classes.attributeArea}>
        <Icon />
      </div>
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
