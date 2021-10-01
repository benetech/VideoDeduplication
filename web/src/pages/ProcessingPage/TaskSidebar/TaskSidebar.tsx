import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import TaskSidebarHeader from "./TaskSidebarHeader";
import TaskList from "../../../components/tasks/TaskList";
import { DefaultTabs, TaskSidebarTab } from "./tabs";
import LoadTrigger from "../../../components/basic/LoadingTrigger/LoadTrigger";
import { useIntl } from "react-intl";
import useTasksLazy from "../../../application/api/tasks/useTasksLazy";
import { Task } from "../../../model/Task";

const useStyles = makeStyles<Theme>((theme) => ({
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
    loadError: intl.formatMessage({
      id: "task.error.load",
    }),
  };
}

const byDate = (first: Task, second: Task): number =>
  second.submissionTime.getTime() - first.submissionTime.getTime();

/**
 * Show all tasks.
 */
function showAll() {
  return true;
}

function TaskSidebar(props: TaskSidebarProps): JSX.Element {
  const {
    filter: filterProp = showAll,
    tabs = DefaultTabs,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const [tab, setTab] = useState(tabs[0]);
  const messages = useMessages();
  const query = useTasksLazy();
  const tasks = useMemo(
    () => ([] as Task[]).concat(...query.pages).sort(byDate),
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
          error={Boolean(query.error)}
        />
      </TaskList>
    </div>
  );
}

type TaskSidebarProps = {
  /**
   * Optional task display filter
   */
  filter?: (task: Task) => void;
  tabs?: TaskSidebarTab[];
  className?: string;
};
export default TaskSidebar;
