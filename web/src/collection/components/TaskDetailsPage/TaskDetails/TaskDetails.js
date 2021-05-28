import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../prop-types/TaskType";
import AttributeTable from "../../../../common/components/AttributeTable";
import { taskAttributes } from "./taskAttributes";
import TaskRequest from "../TaskRequest";
import TaskResults from "../TaskResults";

const useStyles = makeStyles((theme) => ({
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
}));

function TaskDetails(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, className)} {...other}>
      <AttributeTable value={task} attributes={taskAttributes} />
      <TaskRequest request={task.request} />
      <TaskResults task={task} />
    </div>
  );
}

TaskDetails.propTypes = {
  /**
   * Task that will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default TaskDetails;
