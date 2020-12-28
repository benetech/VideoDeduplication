import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../prop-types/TaskType";
import getStatusIcon from "./helpers/getStatusIcon";

const useStyles = makeStyles((theme) => ({
  statusIcon: {
    fontSize: 52,
  },
}));

function StatusIcon(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const Icon = getStatusIcon(task.status);
  return (
    <Icon
      className={clsx(classes.statusIcon, className)}
      color="primary"
      {...other}
    />
  );
}

StatusIcon.propTypes = {
  /**
   * Background task which will be summarized.
   */
  task: TaskType,
  className: PropTypes.string,
};

export default StatusIcon;
