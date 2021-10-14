import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { Task } from "../../../model/Task";
import getStatusIcon from "./helpers/getStatusIcon";

const useStyles = makeStyles<Theme>(() => ({
  statusIcon: {
    fontSize: 52,
  },
}));

function StatusIcon(props: StatusIconProps): JSX.Element | null {
  const { task, className, ...other } = props;
  const classes = useStyles();

  if (task == null) {
    return null;
  }

  const Icon = getStatusIcon(task.status);
  return (
    <Icon
      className={clsx(classes.statusIcon, className)}
      color="primary"
      {...other}
    />
  );
}

type StatusIconProps = {
  /**
   * Background task which will be summarized.
   */
  task?: Task;
  className?: string;
};
export default StatusIcon;
