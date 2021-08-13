import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useServer } from "../../../server-api/context";
import { deleteTask } from "../../state/tasks/common/actions";
import resolveValue from "../../../lib/helpers/resolveValue";
import handleError from "../../../lib/helpers/handleError";
import getEntityId from "../../../lib/helpers/getEntityId";

/**
 * Reusable hook for task deletion.
 * @param {function|TaskEntity|string|number|undefined} override
 * @param {*[]} deps override dependencies
 * @param {boolean} raise if false, the callback will not throw exceptions.
 * @return {function}
 */
export default function useDeleteTask(override, deps = [], raise = true) {
  const server = useServer();
  const dispatch = useDispatch();

  return useCallback(
    async (value) => {
      try {
        const task = resolveValue(value, override);
        await server.tasks.delete(task);
        dispatch(deleteTask(getEntityId(task)));
      } catch (error) {
        handleError(raise, error);
      }
    },
    [raise, ...deps]
  );
}
