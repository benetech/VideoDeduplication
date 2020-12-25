import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskPageTabs from "./TaskPageTabs";
import { Route, Switch } from "react-router-dom";
import { routes } from "../../../routing/routes";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 3,
    minWidth: theme.dimensions.collectionPage.width,
  },
  content: {
    paddingTop: theme.spacing(5),
    display: "flex",
    alignItems: "stretch",
  },
}));

function TaskDetailsPage(props) {
  const { className, ...other } = props;
  const classes = useStyles();

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <TaskPageTabs />
      <div className={classes.content}>
        <Switch>
          <Route exact path={routes.collection.task}>
            TBD: Task details...
          </Route>
          <Route exact path={routes.collection.taskLogs}>
            TBD: Task logs...
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
