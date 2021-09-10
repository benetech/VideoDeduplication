import React, { useMemo, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskSidebarHeader from "./TaskSidebarHeader";
import TaskList from "../../../components/tasks/TaskList";
import { Tab } from "./tabs";
import LoadTrigger from "../../../components/basic/LoadingTrigger/LoadTrigger";
import { useIntl } from "react-intl";
import useTasksLazy from "../../../application/api/tasks/useTasksLazy";

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
  const query = useTasksLazy();
  const tasks = useMemo(
    () => [].concat(...query.pages).sort(byDate),
    [query.pages]
  );

  return (
    <div className={clsx(classes.container, className)} {...other}>
      <TaskSidebarHeader count={query.total} tab={tab} onTabChange={setTab} />
      <TaskList className={classes.tasks}>
        {tasks
          .filter(tab.filter)
          .filter(filterProp)
          .map((task) => (
            <TaskList.Item task={task} key={task.id} />
          ))}
        <LoadTrigger
          loading={query.isLoading}
          onLoad={query.fetchNextPage}
          hasMore={query.hasNextPage}
          container={TaskList.ItemContainer}
          errorMessage={messages.loadError}
          error={query.error}
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
