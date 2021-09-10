import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskPageTabs from "./TaskPageTabs";
import { Route, Switch } from "react-router-dom";
import { routes } from "../../routing/routes";
import TaskLogs from "./TaskLogs";
import { useParams } from "react-router";
import { randomTask } from "../../server-api/MockServer/fake-data/tasks";
import TaskStatus from "../../prop-types/TaskStatus";
import TaskSummaryHeader from "../../components/tasks/TaskSummaryHeader";
import useTask from "../../application/api/tasks/useTask";
import TaskLoadingHeader from "../../components/tasks/TaskLoadingHeader";
import TaskDetails from "../../components/tasks/TaskDetails";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 3,
    minWidth: theme.dimensions.collectionPage.width,
  },
  header: {
    marginBottom: theme.spacing(5),
  },
  content: {
    paddingTop: theme.spacing(5),
    display: "flex",
    alignItems: "stretch",
  },
}));

function TaskDetailsPage(props) {
  const { className, ...other } = props;
  const { id } = useParams();
  const classes = useStyles();
  const { task, error, refetch: loadTask } = useTask(id);
  const dummyTask = randomTask({ id, status: TaskStatus.RUNNING });

  if (task == null) {
    return (
      <div className={clsx(classes.root, className)} {...other}>
        <TaskLoadingHeader
          error={error}
          onRetry={loadTask}
          className={classes.header}
        />
        <TaskPageTabs />
      </div>
    );
  }

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <TaskSummaryHeader task={task || dummyTask} className={classes.header} />
      <TaskPageTabs />
      <div className={classes.content}>
        <Switch>
          <Route exact path={routes.processing.task}>
            <TaskDetails task={task} />
          </Route>
          <Route exact path={routes.processing.taskLogs}>
            <TaskLogs task={task} />
          </Route>
        </Switch>
      </div>
    </div>
  );
}

TaskDetailsPage.propTypes = {
  className: PropTypes.string,
};

export default TaskDetailsPage;
