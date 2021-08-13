import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useServer } from "../../server-api/context";
import { useDispatch, useSelector } from "react-redux";
import {
  setTaskLogs,
  subscribeForTaskLogs,
  unsubscribeFromTaskLogs,
} from "../../application/state/taskLogs/actions";
import { selectTaskLogs } from "../../application/state/root/selectors";
import TaskType from "../../prop-types/TaskType";
import TaskStatus from "../../prop-types/TaskStatus";

const useStyles = makeStyles((theme) => ({
  logsContainer: {
    overflow: "auto",
    width: "100%",
    height: "50vh",
    minHeight: 300,
    padding: theme.spacing(2),
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "#272c34",
    color: theme.palette.common.white,
  },
  logs: {},
  progress: {},
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
  const [follow, setFollow] = useState(true);
  const containerRef = useRef();

  // Fetch available logs
  useEffect(() => {
    if (active) {
      dispatch(subscribeForTaskLogs(task.id));
      return () => dispatch(unsubscribeFromTaskLogs(task.id));
    } else if (taskLogs.taskId !== task.id || taskLogs.more) {
      dispatch(setTaskLogs({ id: task.id, logs: null, more: true }));
      server.tasks.logs(task.id).then((data) => {
        dispatch(setTaskLogs({ id: task.id, logs: [data], more: false }));
      });
    }
  }, [task.id]);

  // Follow logs
  useEffect(() => {
    if (follow && containerRef.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [containerRef, taskLogs.logs?.length, follow]);

  // Enable/disable following on scroll
  const handleScroll = useCallback(
    (event) => {
      const container = event.target;
      if (container != null) {
        const maxScroll = container.scrollHeight - container.clientHeight;
        const containerScrolledToBottom = container.scrollTop === maxScroll;
        if (containerScrolledToBottom !== follow) {
          setFollow(containerScrolledToBottom);
        }
      }
    },
    [follow]
  );

  return (
    <div
      className={clsx(classes.logsContainer, className)}
      onScroll={handleScroll}
      ref={containerRef}
      {...other}
    >
      {taskLogs.logs && <pre className={classes.logs}>{taskLogs.logs}</pre>}
      {taskLogs.more && active && (
        <CircularProgress
          size={20}
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
