import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskListHeader from "./TaskListHeader";
import TaskListItem from "./TaskListItem";

const useStyles = makeStyles((theme) => ({
  container: {
    width: 380,
  },
  tasks: {
    overflowY: "auto",
  },
  task: {
    margin: theme.spacing(1),
  },
}));

function TaskList(props) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.container, className)} {...other}>
      <TaskListHeader count={325} />
      <div className={classes.tasks}>{children}</div>
    </div>
  );
}

/**
 * Task list item.
 */
TaskList.Item = TaskListItem;

TaskList.propTypes = {
  /**
   * Task list items.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default TaskList;
