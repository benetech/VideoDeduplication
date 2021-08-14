import { useServer } from "../../../server-api/context";
import { useDispatch } from "react-redux";
import { useCallback } from "react";
import resolveValue from "../../../lib/helpers/resolveValue";
import { updateTask } from "../../state/tasks/common/actions";

/**
 * Get callback to run tasks.
 * @param {function|TaskRequest|undefined} override task
 * @param deps override's dependencies
 * @return {(function(*): Promise<TaskEntity>)}
 */
export default function useRunTask(override, deps = []) {
  const server = useServer();
  const dispatch = useDispatch();

  return useCallback(async (value) => {
    const request = resolveValue(value, override);
    const task = await server.tasks.create(request);
    dispatch(updateTask(task));
    return task;
  }, deps);
}
