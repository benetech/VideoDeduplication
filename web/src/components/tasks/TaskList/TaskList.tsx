import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import TaskListItem from "./TaskListItem";
import ItemContainer from "./ItemContainer";

const useStyles = makeStyles<Theme>({
  container: {
    display: "flex",
    flexDirection: "column",
  },
});

function TaskList(props: TaskListProps): JSX.Element {
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
type TaskListProps = {
  /**
   * Task list items.
   */
  children?: React.ReactNode;
  className?: string;
};
export default TaskList;
