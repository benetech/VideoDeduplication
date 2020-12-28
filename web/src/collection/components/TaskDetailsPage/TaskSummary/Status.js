import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import TaskStatus from "../../../state/tasks/TaskStatus";
import TaskType from "../../../prop-types/TaskType";

const useStyles = makeStyles((theme) => ({
  status: {
    borderLeft: "1px solid #D8D8D8",
    paddingLeft: theme.spacing(0.5),
    fontFamily: "Roboto",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0,
    lineHeight: "30px",
    width: 120,
  },
}));

/**
 * Determine task status text
 */
function getStatusText(status, messages) {
  switch (status) {
    case TaskStatus.PENDING:
      return messages.pending;
    case TaskStatus.RUNNING:
      return messages.running;
    case TaskStatus.SUCCESS:
      return messages.success;
    case TaskStatus.FAILURE:
      return messages.failure;
    case TaskStatus.CANCELLED:
      return messages.cancelled;
    default:
      console.warn(`Unknown task status: ${status}`);
      return status;
  }
}

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    pending: intl.formatMessage({ id: "task.statusLong.pending" }),
    running: intl.formatMessage({ id: "task.statusLong.running" }),
    success: intl.formatMessage({ id: "task.statusLong.success" }),
    failure: intl.formatMessage({ id: "task.statusLong.failure" }),
    cancelled: intl.formatMessage({ id: "task.statusLong.cancelled" }),
  };
}

function Status(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  return (
    <div className={clsx(classes.status, className)} {...other}>
      {getStatusText(task.status, messages)}
    </div>
  );
}

Status.propTypes = {
  /**
   * Background task which will be summarized.
   */
  task: TaskType,
  className: PropTypes.string,
};

export default Status;
