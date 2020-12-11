import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskListItem from "./TaskListItem";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
  },
});

function TaskList(props) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.container, className)} {...other}>
      {children}
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
