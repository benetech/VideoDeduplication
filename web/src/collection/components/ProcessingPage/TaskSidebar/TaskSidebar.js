import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskSidebarHeader from "./TaskSidebarHeader";
import { randomTasks } from "../../../../server-api/MockServer/fake-data/tasks";
import TaskList from "../TaskList";

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

const tasks = randomTasks({
  pending: 2,
  running: 1,
  failure: 2,
  cancelled: 2,
  success: 2,
});

function TaskSidebar(props) {
  const { className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.container, className)} {...other}>
      <TaskSidebarHeader count={325} />
      <TaskList className={classes.tasks}>
        {tasks.map((task) => (
          <TaskList.Item task={task} key={task.id} />
        ))}
      </TaskList>
    </div>
  );
}

TaskSidebar.propTypes = {
  className: PropTypes.string,
};

export default TaskSidebar;
