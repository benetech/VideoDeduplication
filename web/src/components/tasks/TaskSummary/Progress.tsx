import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { CircularProgress, Theme } from "@material-ui/core";
import { Task, TaskStatus } from "../../../model/Task";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  percents: {
    color: theme.palette.action.textInactive,
  },
}));

function isProgressDefined(task: Task): boolean {
  return !(task.progress == null && task.status === TaskStatus.RUNNING);
}

function Progress(props: ProgressProps): JSX.Element | null {
  const { task, className, ...other } = props;
  const classes = useStyles();

  if (task == null || task.status !== TaskStatus.RUNNING) {
    return null;
  }

  const progress = task.progress == null ? 0 : task.progress * 100;
  const variant = isProgressDefined(task) ? "determinate" : "indeterminate";

  return (
    <div className={clsx(classes.container, className)} {...other}>
      <Box position="relative" display="inline-flex">
        <CircularProgress size={60} value={progress} variant={variant} />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
          className={classes.percents}
        >
          {Math.round(progress)}%
        </Box>
      </Box>
    </div>
  );
}

type ProgressProps = {
  /**
   * Background task which will be summarized.
   */
  task?: Task;
  className?: string;
};
export default Progress;
