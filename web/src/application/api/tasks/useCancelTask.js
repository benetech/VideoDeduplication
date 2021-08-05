import { useCallback } from "react";
import { updateTask } from "../../state/tasks/actions";
import { useDispatch } from "react-redux";
import { useServer } from "../../../server-api/context";

/**
 * Reusable hook to cancel task.
 */
export default function useCancelTask({ id, onTrigger }) {
  const server = useServer();
  const dispatch = useDispatch();

  return useCallback(() => {
    if (onTrigger != null) {
      onTrigger();
    }
    server.tasks
      .cancel(id)
      .then((task) => {
        dispatch(updateTask(task));
      })
      .catch(console.error);
  }, [id, onTrigger]);
}
