import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import TasksSidebarHeader from "../../components/tasks/TasksSidebarHeader";
import TaskSidebar from "../ProcessingPage/TaskSidebar";
import RepositoriesPageHeader from "./RepositoriesPageHeader";

const useStyles = makeStyles<Theme>((theme) => ({
  repositoriesPage: {
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 3,
    minWidth: theme.dimensions.collectionPage.width,
    display: "flex",
    alignItems: "stretch",
  },
  content: {
    flexGrow: 1,
  },
  tasks: {
    marginLeft: theme.spacing(4),
    maxWidth: 380,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  header: {
    marginBottom: theme.spacing(3),
  },
}));

type RepositoriesPageProps = {
  className?: string;
};

function RepositoriesPage(props: RepositoriesPageProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();

  const [showTasks, setShowTasks] = useState(true);
  const handleShowTasks = useCallback(() => setShowTasks(true), []);
  const handleHideTasks = useCallback(() => setShowTasks(false), []);

  return (
    <div className={clsx(classes.repositoriesPage, className)} {...other}>
      <div className={clsx(classes.column, classes.content)}>
        <RepositoriesPageHeader
          showTasks={showTasks}
          onShowTasks={handleShowTasks}
          className={classes.header}
        />
        <div>Content</div>
      </div>
      {showTasks && (
        <div className={clsx(classes.column, classes.tasks)}>
          <TasksSidebarHeader
            onClose={handleHideTasks}
            className={classes.header}
          />
          <TaskSidebar />
        </div>
      )}
    </div>
  );
}

export default RepositoriesPage;
