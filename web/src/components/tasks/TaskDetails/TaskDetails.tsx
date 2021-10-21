import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Paper, Theme } from "@material-ui/core";
import { Task } from "../../../model/Task";
import AttributeTable from "../../basic/AttributeTable";
import { taskAttributes } from "./taskAttributes";
import TaskRequest from "../TaskRequest";
import TaskResults from "../TaskResults";
import { useIntl } from "react-intl";
import LabeledSection from "../../basic/LabeledSection";
import TaskErrorView from "../TaskErrorView";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    width: "100%",
    overflow: "hidden",
  },
  attrName: {
    ...theme.mixins.valueNormal,
    color: theme.palette.action.textInactive,
  },
  attrValue: {
    ...theme.mixins.valueNormal,
    ...theme.mixins.textEllipsis,
    maxWidth: 300,
  },
  pane: {
    marginBottom: theme.spacing(4),
    margin: theme.spacing(2),
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    task: intl.formatMessage({
      id: "task",
    }),
    request: intl.formatMessage({
      id: "task.request",
    }),
    results: intl.formatMessage({
      id: "task.results",
    }),
    error: intl.formatMessage({ id: "error" }),
  };
}

function TaskDetails(props: TaskDetailsProps): JSX.Element {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  return (
    <div className={clsx(classes.root, className)} {...other}>
      <Paper className={classes.pane}>
        <LabeledSection title={messages.task} collapsible>
          <AttributeTable value={task} attributes={taskAttributes} />
        </LabeledSection>
      </Paper>
      <Paper className={classes.pane}>
        <LabeledSection title={messages.request} collapsible>
          <TaskRequest task={task} />
        </LabeledSection>
      </Paper>
      {task.error != null && (
        <Paper className={classes.pane}>
          <LabeledSection title={messages.error} collapsible>
            <TaskErrorView error={task.error} />
          </LabeledSection>
        </Paper>
      )}
      {task.result != null && (
        <Paper className={classes.pane}>
          <LabeledSection title={messages.results} collapsible>
            <TaskResults task={task} />
          </LabeledSection>
        </Paper>
      )}
    </div>
  );
}

type TaskDetailsProps = {
  /**
   * Task that will be displayed.
   */
  task: Task;
  className?: string;
};
export default TaskDetails;
