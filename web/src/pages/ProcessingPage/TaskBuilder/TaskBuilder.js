import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Button from "../../../components/basic/Button";
import PlayArrowOutlinedIcon from "@material-ui/icons/PlayArrowOutlined";
import { useIntl } from "react-intl";
import TaskTypeDescriptors from "./TaskTypeDescriptors";
import TypeSelector from "./TypeSelector";
import { updateTask } from "../../../application/state/tasks/actions";
import { useServer } from "../../../server-api/context";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
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
  const [req, setReq] = useState({ type: taskType.type });
  const [valid, setValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const server = useServer();
  const dispatch = useDispatch();

  const handleProcess = useCallback(() => {
    setLoading(true);
    server
      .createTask(req)
      .then((task) => dispatch(updateTask(task)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [req]);

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
          disabled={!valid || loading}
          onClick={handleProcess}
        >
          <PlayArrowOutlinedIcon />
          {messages.runTask}
        </Button>
      </div>
      <TaskForm
        request={req}
        onChange={setReq}
        onValidated={setValid}
        className={classes.taskForm}
      />
    </div>
  );
}

TaskBuilder.propTypes = {
  className: PropTypes.string,
};

export default TaskBuilder;
