import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskSidebarHeader from "./TaskSidebarHeader";
import TaskList from "../TaskList";
import { Tab } from "./tabs";
import { useDispatch, useSelector } from "react-redux";
import { selectTasks } from "../../../state/selectors";
import LoadTrigger from "../../../../common/components/LoadingTrigger/LoadTrigger";
import { fetchTaskSlice } from "../../../state/tasks/actions";
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

function TaskSidebar(props) {
  const { className, ...other } = props;
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
        {tasks.filter(tab.filter).map((task) => (
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
  className: PropTypes.string,
};

export default TaskSidebar;
