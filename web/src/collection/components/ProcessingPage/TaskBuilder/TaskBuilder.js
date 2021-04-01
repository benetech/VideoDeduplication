import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Button from "../../../../common/components/Button";
import PlayArrowOutlinedIcon from "@material-ui/icons/PlayArrowOutlined";
import { useIntl } from "react-intl";
import TaskTypeDescriptors from "./TaskTypeDescriptors";
import TypeSelector from "./TypeSelector";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 600,
    padding: theme.spacing(3),
    backgroundColor: theme.palette.common.white,
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  select: {
    margin: theme.spacing(1),
  },
  runButton: {
    marginLeft: theme.spacing(1),
  },
  title: {
    flexShrink: 0,
    flexGrow: 20,
    fontWeight: "bold",
    ...theme.mixins.title2,
  },
  taskForm: {
    marginTop: theme.spacing(2),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    runTask: intl.formatMessage({ id: "actions.runTask" }),
    newTask: intl.formatMessage({ id: "task.new" }),
  };
}

function TaskBuilder(props) {
  const { className, ...other } = props;
  const [taskType, setTaskType] = useState(TaskTypeDescriptors[0]);
  const classes = useStyles();
  const messages = useMessages();
  const [task, setTask] = useState(null);

  const TaskForm = taskType.component;

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{messages.newTask}</div>
        <TypeSelector
          value={taskType}
          onChange={setTaskType}
          className={classes.select}
        />
        <Button
          className={classes.runButton}
          color="primary"
          variant="contained"
        >
          <PlayArrowOutlinedIcon />
          {messages.runTask}
        </Button>
      </div>
      <TaskForm task={task} onChange={setTask} className={classes.taskForm} />
    </div>
  );
}

TaskBuilder.propTypes = {
  className: PropTypes.string,
};

export default TaskBuilder;
