import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskListItem from "./TaskListItem";
import ItemContainer from "./ItemContainer";

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

/**
 * Task list item container.
 */
TaskList.ItemContainer = ItemContainer;

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
