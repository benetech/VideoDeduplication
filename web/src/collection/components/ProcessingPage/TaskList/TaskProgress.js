import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import LinearProgress from "@material-ui/core/LinearProgress";

const useStyles = makeStyles((theme) => ({
  taskProgress: {
    display: "flex",
    alignItems: "center",
  },
  progress: {
    flexGrow: 1,
  },
  percents: {
    ...theme.mixins.captionText,
    marginLeft: theme.spacing(2),
  },
}));

function TaskProgress(props) {
  const { value, className, ...other } = props;
  const classes = useStyles();
  const hasValue = value != null;
  const variant = hasValue ? "determinate" : "indeterminate";
  return (
    <div className={clsx(classes.taskProgress, className)} {...other}>
      <LinearProgress
        variant={variant}
        value={hasValue && value * 100}
        className={classes.progress}
      />
      {hasValue && (
        <div className={classes.percents}>{Math.floor(value * 100)}%</div>
      )}
    </div>
  );
}

TaskProgress.propTypes = {
  /**
   * Task progress value (0 - 1.0).
   */
  value: PropTypes.number,
  className: PropTypes.string,
};

export default TaskProgress;
