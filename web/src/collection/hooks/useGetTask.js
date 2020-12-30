import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCachedTask } from "../state/selectors";
import { useServer } from "../../server-api/context";
import { Status } from "../../server-api/Response";
import { cacheTask } from "../state/taskCache/actions";

/**
 * Fetch task by id.
 * @param id
 */
export function useGetTask(id) {
  const task = useSelector(selectCachedTask(id));
  const [error, setError] = useState(null);
  const server = useServer();
  const dispatch = useDispatch();

  const loadTask = useCallback(() => {
    const doLoad = async () => {
      setError(null);
      const response = await server.fetchTask({ id });
      if (response.success) {
        const task = response.data;
        dispatch(cacheTask(task));
      } else {
        console.error(response.error);
        setError({ status: response.status });
      }
    };

    doLoad().catch((error) => {
      console.error(error);
      setError({ status: Status.CLIENT_ERROR });
    });
  }, [id]);

  /**
   * Load task or update cache history on hit.
   */
  useEffect(() => {
    if (task != null) {
      // Cache hit! Update cache history.
      dispatch(cacheTask(task));
    } else {
      // Otherwise trigger task loading.
      loadTask();
    }
  }, [id, task]);

  return {
    task,
    error,
    loadTask,
  };
}

export default useGetTask;
