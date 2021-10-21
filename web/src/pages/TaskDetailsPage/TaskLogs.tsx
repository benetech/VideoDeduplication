import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Task } from "../../model/Task";
import useTaskLogs from "../../application/api/tasks/useTaskLogs";
import isActiveTask from "../../application/api/tasks/helpers/isActiveTask";

const useStyles = makeStyles<Theme>((theme) => ({
  logsContainer: {
    overflow: "auto",
    width: "100%",
    height: "50vh",
    minHeight: 300,
    padding: theme.spacing(2),
    paddingTop: 0,
    paddingBottom: 0,
    ...theme.mixins.logs,
  },
  logs: {},
  progress: {},
}));

function TaskLogs(props: TaskLogsProps): JSX.Element {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const active = isActiveTask(task);
  const taskLogs = useTaskLogs(task);
  const [follow, setFollow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Follow logs
  useEffect(() => {
    if (follow && containerRef.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [containerRef, taskLogs.logs?.length, follow]); // Enable/disable following on scroll

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
      {taskLogs.hasMore && active && (
        <CircularProgress
          size={20}
          color="inherit"
          className={classes.progress}
        />
      )}
    </div>
  );
}

type TaskLogsProps = {
  /**
   * Task which logs are to be displayed.
   */
  task: Task;
  className?: string;
};
export default TaskLogs;
