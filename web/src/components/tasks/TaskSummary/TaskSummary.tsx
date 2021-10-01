import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { Task } from "../../../model/Task";
import indentAttributes from "../../basic/AttributeLists/indentAttributes";
import StatusIcon from "./StatusIcon";
import Description from "./Description";
import Progress from "./Progress";
import Status from "./Status";

const useStyles = makeStyles<Theme>((theme) => ({
  summary: {
    display: "flex",
    alignItems: "center",
  },
  spacer: {
    width: theme.spacing(3),
  },
  divider: {},
}));

/**
 * Create a function that will assign a task for each input.
 */
function bindProps(
  task: Task
): (attribute: React.ReactNode) => React.ReactNode {
  return (attribute: React.ReactNode) => {
    if (!React.isValidElement(attribute)) {
      return null;
    }

    return React.cloneElement(attribute, {
      task,
      ...attribute.props,
    });
  };
}
/**
 * Linear list of background task attributes.
 */

function TaskSummary(props: TaskSummaryProps): JSX.Element {
  const { task, divider = false, children, className, ...other } = props;
  const classes = useStyles();

  // Set required child properties
  let attributes: React.ReactNode[] | null | undefined = React.Children.map(
    children,
    bindProps(task)
  );

  // Add correct indentation between attributes
  attributes = indentAttributes(attributes, divider, {
    spacerClass: classes.spacer,
    dividerClass: classes.divider,
  });

  return (
    <div className={clsx(classes.summary, className)} {...other}>
      {attributes}
    </div>
  );
}

TaskSummary.StatusIcon = StatusIcon;
TaskSummary.Description = Description;
TaskSummary.Progress = Progress;
TaskSummary.Status = Status;

type TaskSummaryProps = {
  /**
   * Background task which will be summarized.
   */
  task: Task;

  /**
   * Show divider between attributes.
   */
  divider?: boolean;

  /**
   * Summary attributes list.
   */
  children?: React.ReactNode;
  className?: string;
};
export default TaskSummary;
