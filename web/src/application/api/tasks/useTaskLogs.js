import { useDispatch, useSelector } from "react-redux";
import { selectTaskLogs } from "../../state/root/selectors";
import { useEffect } from "react";
import {
  setTaskLogs,
  subscribeForTaskLogs,
  unsubscribeFromTaskLogs,
} from "../../state/tasks/logs/actions";
import { useServer } from "../../../server-api/context";
import isActiveTask from "./helpers/isActiveTask";

/**
 * Hook to get task logs.
 * @param {TaskEntity} task
 * @return {{logs: string[], more: boolean}}
 */
export default function useTaskLogs(task) {
  const server = useServer();
  const dispatch = useDispatch();
  const taskLogs = useSelector(selectTaskLogs);

  // Fetch available logs
  useEffect(() => {
    if (isActiveTask(task)) {
      dispatch(subscribeForTaskLogs(task.id));
      return () => dispatch(unsubscribeFromTaskLogs(task.id));
    } else if (taskLogs.taskId !== task.id || taskLogs.more) {
      dispatch(setTaskLogs({ id: task.id, logs: null, more: true }));
      server.tasks
        .logs(task.id)
        .then((data) => {
          dispatch(setTaskLogs({ id: task.id, logs: [data], more: false }));
        })
        .catch(console.error);
    }
  }, [task.id]);

  return {
    logs: taskLogs.logs || [],
    more: taskLogs.more,
  };
}
