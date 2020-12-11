import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ProcessingPageHeader from "./ProcessingPageHeader";
import { useHistory } from "react-router-dom";
import { routes } from "../../../routing/routes";
import FileSelector from "./FileSelector";
import TaskList from "./TaskList";
import { randomTasks } from "../../../server-api/MockServer/fake-data/tasks";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 3,
    minWidth: theme.dimensions.collectionPage.width,
  },
  content: {
    display: "flex",
    alignItems: "stretch",
  },
  selector: {
    flexGrow: 1,
  },
  taskList: {
    marginLeft: theme.spacing(4),
  },
}));

const tasks = randomTasks({
  pending: 4,
  running: 1,
  failure: 2,
  cancelled: 2,
  success: 2,
});

function ProcessingPage(props) {
  const { className, ...other } = props;
  const classes = useStyles();
  const history = useHistory();

  const handleClose = useCallback(
    () => history.push(routes.collection.fingerprints, { keepFilters: true }),
    []
  );

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <ProcessingPageHeader onClose={handleClose} />
      <div className={classes.content}>
        <FileSelector className={classes.selector} />
        <TaskList className={classes.taskList}>
          {tasks.map((task) => (
            <TaskList.Item task={task} key={task.id} />
          ))}
        </TaskList>
      </div>
    </div>
  );
}

ProcessingPage.propTypes = {
  className: PropTypes.string,
};

export default ProcessingPage;
