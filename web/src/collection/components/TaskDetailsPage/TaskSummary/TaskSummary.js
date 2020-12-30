import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../prop-types/TaskType";
import indentAttributes from "../../../../common/components/AttributeLists/indentAttributes";
import StatusIcon from "./StatusIcon";
import Description from "./Description";
import Progress from "./Progress";
import Status from "./Status";

const useStyles = makeStyles((theme) => ({
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
function bindProps(task) {
  return (attribute) => {
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
function TaskSummary(props) {
  const { task, divider, children, className, ...other } = props;
  const classes = useStyles();

  // Set required child properties
  let attributes = React.Children.map(children, bindProps(task));

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

TaskSummary.propTypes = {
  /**
   * Background task which will be summarized.
   */
  task: TaskType.isRequired,
  /**
   * Show divider between attributes.
   */
  divider: PropTypes.bool,
  /**
   * Summary attributes list.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default TaskSummary;
