import { useCallback } from "react";
import { deleteTask } from "../../application/state/tasks/actions";
import { useDispatch } from "react-redux";
import { useServer } from "../../server-api/context";

/**
 * Reusable hook for task deletion.
 */
export default function useDeleteTask({ id, onTrigger, onSuccess }) {
  const server = useServer();
  const dispatch = useDispatch();

  return useCallback(() => {
    if (onTrigger != null) {
      onTrigger();
    }
    server.deleteTask({ id }).then((response) => {
      if (response.success) {
        dispatch(deleteTask(id));
        if (onSuccess != null) {
          onSuccess(id);
        }
      } else {
        console.log(`Error delete task: ${id}`, response.error);
      }
    });
  }, [id, onTrigger]);
}
