import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskSidebarHeader from "./TaskSidebarHeader";
import TaskList from "../TaskList";
import { Tab } from "./tabs";
import { useDispatch, useSelector } from "react-redux";
import { selectTasks } from "../../../application/state/root/selectors";
import LoadTrigger from "../../../components/basic/LoadingTrigger/LoadTrigger";
import { fetchTaskSlice } from "../../../application/state/tasks/actions";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  container: {},
  tasks: {
    marginTop: theme.spacing(2),
    maxHeight: 450,
    overflowY: "auto",
  },
  task: {
    margin: theme.spacing(1),
  },
}));

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    loadError: intl.formatMessage({ id: "task.error.load" }),
  };
}

const byDate = (first, second) => second.submissionTime - first.submissionTime;

/**
 * Show all tasks.
 */
function showAll() {
  return true;
}

function TaskSidebar(props) {
  const { filter: filterProp = showAll, className, ...other } = props;
  const classes = useStyles();
  const [tab, setTab] = useState(Tab.ALL);
  const messages = useMessages();
  const dispatch = useDispatch();
  const taskState = useSelector(selectTasks);
  const tasks = [...taskState.tasks].sort(byDate);

  // Load next slice of task collection
  const handleLoad = useCallback(() => dispatch(fetchTaskSlice()), []);

  return (
    <div className={clsx(classes.container, className)} {...other}>
      <TaskSidebarHeader
        count={taskState.total}
        tab={tab}
        onTabChange={setTab}
      />
      <TaskList className={classes.tasks}>
        {tasks
          .filter(tab.filter)
          .filter(filterProp)
          .map((task) => (
            <TaskList.Item task={task} key={task.id} />
          ))}
        <LoadTrigger
          loading={taskState.loading}
          onLoad={handleLoad}
          hasMore={taskState.total == null || tasks.length < taskState.total}
          container={TaskList.ItemContainer}
          errorMessage={messages.loadError}
          error={taskState.error}
        />
      </TaskList>
    </div>
  );
}

TaskSidebar.propTypes = {
  /**
   * Optional task display filter
   */
  filter: PropTypes.func,
  className: PropTypes.string,
};

export default TaskSidebar;
