import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";

const useStyles = makeStyles<Theme>((theme) => ({
  taskProgress: {
    display: "flex",
    alignItems: "center",
  },
  progress: {
    flexGrow: 1,
  },
  percents: { ...theme.mixins.captionText, marginLeft: theme.spacing(2) },
}));

function TaskProgress(props: TaskProgressProps): JSX.Element {
  const { value, className, ...other } = props;
  const classes = useStyles();
  const hasValue = value != null;
  const variant = hasValue ? "determinate" : "indeterminate";
  return (
    <div className={clsx(classes.taskProgress, className)} {...other}>
      <LinearProgress
        variant={variant}
        value={hasValue ? value * 100 : 0}
        className={classes.progress}
      />
      {hasValue && (
        <div className={classes.percents}>{Math.floor(value * 100)}%</div>
      )}
    </div>
  );
}

type TaskProgressProps = {
  /**
   * Task progress value (0 - 1.0).
   */
  value?: number;
  className?: string;
};
export default TaskProgress;
