import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCachedTask } from "../../state/root/selectors";
import { useServer } from "../../../server-api/context";
import { cacheTask } from "../../state/tasks/cache/actions";
import ServerError from "../../../server-api/Server/ServerError";
import handleError from "../../../lib/helpers/handleError";

/**
 * Fetch task by id.
 * @param {number|string} id
 * @param {boolean} raise if false, the load callback will not throw exceptions
 */
export function useTask(id, raise = false) {
  const task = useSelector(selectCachedTask(id));
  const [error, setError] = useState(null);
  const server = useServer();
  const dispatch = useDispatch();

  const loadTask = useCallback(async () => {
    try {
      setError(null);
      const task = await server.tasks.get(id);
      dispatch(cacheTask(task));
    } catch (error) {
      setError({ status: error.code || ServerError.CLIENT_ERROR });
      handleError(raise, error);
    }
  }, [id, raise]);

  // Load task or update cache history on hit.
  useEffect(() => {
    if (task != null) {
      // Cache hit! Update cache history.
      dispatch(cacheTask(task));
    } else {
      // Otherwise trigger task loading.
      loadTask().catch(console.error);
    }
  }, [id, task]);

  return {
    task,
    error,
    loadTask,
  };
}

export default useTask;
