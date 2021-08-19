import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../prop-types/TaskType";
import TaskStatus from "../../../prop-types/TaskStatus";
import Box from "@material-ui/core/Box";
import { CircularProgress } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  percents: {
    color: theme.palette.action.textInactive,
  },
}));

function isProgressDefined(task) {
  return !(task.progress == null && task.status === TaskStatus.RUNNING);
}

function Progress(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const progress = task.progress == null ? 0 : task.progress * 100;
  const variant = isProgressDefined(task) ? "determinate" : "indeterminate";
  if (task.status !== TaskStatus.RUNNING) {
    return null;
  }

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

Progress.propTypes = {
  /**
   * Background task which will be summarized.
   */
  task: TaskType,
  className: PropTypes.string,
};

export default Progress;
