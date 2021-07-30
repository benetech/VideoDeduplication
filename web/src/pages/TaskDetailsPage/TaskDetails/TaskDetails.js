import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../prop-types/TaskType";
import AttributeTable from "../../../components/basic/AttributeTable";
import { taskAttributes } from "./taskAttributes";
import TaskRequest from "../TaskRequest";
import TaskResults from "../TaskResults";
import { useIntl } from "react-intl";
import { Paper } from "@material-ui/core";
import LabeledSection from "../../../components/basic/LabeledSection";

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
    task: intl.formatMessage({ id: "task" }),
    request: intl.formatMessage({ id: "task.request" }),
    results: intl.formatMessage({ id: "task.results" }),
  };
}

function TaskDetails(props) {
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
      <Paper className={classes.pane}>
        <LabeledSection title={messages.results} collapsible>
          <TaskResults task={task} />
        </LabeledSection>
      </Paper>
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
