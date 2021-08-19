import { useCallback } from "react";
import { updateTask } from "../../state/tasks/common/actions";
import { useDispatch } from "react-redux";
import { useServer } from "../../../server-api/context";
import handleError from "../../../lib/helpers/handleError";
import resolveValue from "../../../lib/helpers/resolveValue";

/**
 * Reusable hook to cancel task.
 * @param {function|TaskEntity|number|string|undefined} override
 * @param {*[]} deps override dependencies
 * @param {boolean} raise if false, the callback will not throw exceptions
 * @return {function}
 */
export default function useCancelTask(override, deps = [], raise = true) {
  const server = useServer();
  const dispatch = useDispatch();

  return useCallback(
    async (value) => {
      try {
        const task = resolveValue(value, override);
        const cancelled = await server.tasks.cancel(task);
        dispatch(updateTask(cancelled));
      } catch (error) {
        handleError(raise, error);
      }
    },
    [raise, ...deps]
  );
}
