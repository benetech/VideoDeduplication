import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { Task } from "../../../model/Task";
import { useIntl } from "react-intl";
import getTaskTextDescription from "./helpers/getTaskTextDescription";
import { format } from "date-fns";

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 2,
    flexShrink: 1,
  },
  description: {
    fontFamily: "Roboto",
    fontSize: 26,
    letterSpacing: 0,
    lineHeight: "30px",
    fontWeight: 500,
  },
  created: {
    ...theme.mixins.valueHighlighted,
    fontWeight: "normal",
    color: theme.palette.action.textInactive,
  },
  date: {},
}));
/**
 * Get translated text.
 */

function useMessages(task: Task | undefined) {
  const intl = useIntl();
  return {
    description:
      task == null ? "null" : getTaskTextDescription(task.request, intl),
    created: intl.formatMessage({
      id: "task.created",
    }),
  };
}

function Description(props: DescriptionProps): JSX.Element | null {
  const { task, className, ...other } = props;
  const messages = useMessages(task);
  const classes = useStyles();

  if (task == null) {
    return null;
  }

  return (
    <div className={clsx(classes.container, className)} {...other}>
      <div className={classes.description}>{messages.description}</div>
      <div>
        <div className={classes.created}>{messages.created}:</div>
        <div className={classes.date}>
          {format(task.submissionTime, "d LLL yyyy")}
        </div>
      </div>
    </div>
  );
}

type DescriptionProps = {
  /**
   * Background task which will be summarized.
   */
  task?: Task;
  className?: string;
};
export default Description;
