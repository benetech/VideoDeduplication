import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import { Task, TaskStatus } from "../../../model/Task";

const useStyles = makeStyles<Theme>((theme) => ({
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
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    pending: intl.formatMessage({
      id: "task.statusLong.pending",
    }),
    running: intl.formatMessage({
      id: "task.statusLong.running",
    }),
    success: intl.formatMessage({
      id: "task.statusLong.success",
    }),
    failure: intl.formatMessage({
      id: "task.statusLong.failure",
    }),
    cancelled: intl.formatMessage({
      id: "task.statusLong.cancelled",
    }),
  };
}

/**
 * Determine task status text
 */
function getStatusText(
  status: TaskStatus,
  messages: ReturnType<typeof useMessages>
): string {
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

function Status(props: StatusProps): JSX.Element | null {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  if (task == null) {
    return null;
  }

  return (
    <div className={clsx(classes.status, className)} {...other}>
      {getStatusText(task.status, messages)}
    </div>
  );
}

type StatusProps = {
  /**
   * Background task which will be summarized.
   */
  task?: Task;
  className?: string;
};
export default Status;
