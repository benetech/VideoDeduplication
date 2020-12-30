import React, { useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useServer } from "../../../server-api/context";
import { useDispatch, useSelector } from "react-redux";
import {
  setTaskLogs,
  subscribeForTaskLogs,
  unsubscribeFromTaskLogs,
} from "../../state/taskLogs/actions";
import { selectTaskLogs } from "../../state/selectors";
import TaskType from "../../prop-types/TaskType";
import TaskStatus from "../../state/tasks/TaskStatus";

const useStyles = makeStyles((theme) => ({
  logsContainer: {
    overflow: "auto",
    width: "100%",
    minHeight: 400,
    padding: theme.spacing(2),
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "#272c34",
    color: theme.palette.common.white,
  },
  logs: {},
  progress: {
    marginTop: theme.spacing(2),
  },
}));

function isActive(task) {
  return (
    task.status === TaskStatus.PENDING || task.status === TaskStatus.RUNNING
  );
}

function TaskLogs(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const server = useServer();
  const active = isActive(task);
  const dispatch = useDispatch();
  const taskLogs = useSelector(selectTaskLogs);

  // Fetch available logs
  useEffect(() => {
    if (active) {
      dispatch(subscribeForTaskLogs(task.id));
      return () => dispatch(unsubscribeFromTaskLogs(task.id));
    } else if (taskLogs.taskId !== task.id || taskLogs.more) {
      dispatch(setTaskLogs({ id: task.id, logs: null, more: true }));
      server.fetchLogs({ id: task.id }).then((resp) => {
        dispatch(setTaskLogs({ id: task.id, logs: [resp.data] }));
      });
    }
  }, [task.id]);

  return (
    <div className={clsx(classes.logsContainer, className)} {...other}>
      {taskLogs.logs && <pre className={classes.logs}>{taskLogs.logs}</pre>}
      {taskLogs.more && active && (
        <CircularProgress
          size={30}
          color="inherit"
          className={classes.progress}
        />
      )}
    </div>
  );
}

TaskLogs.propTypes = {
  /**
   * Task which logs are to be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default TaskLogs;
