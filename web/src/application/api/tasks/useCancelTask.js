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
    server.cancelTask({ id }).then((response) => {
      if (response.success) {
        dispatch(updateTask(response.data));
      } else {
        console.error(`Error cancel task: ${id}`, response.error);
      }
    });
  }, [id, onTrigger]);
}
