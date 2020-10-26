import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCachedFile } from "../state/selectors";
import { useServer } from "../../server-api/context";
import { cacheFile } from "../state/actions";
import { Status } from "../../server-api/Response";

/**
 * Fetch file by id.
 * @param id
 */
export function useFile(id) {
  const file = useSelector(selectCachedFile(id));
  const [error, setError] = useState(null);
  const server = useServer();
  const dispatch = useDispatch();

  const loadFile = useCallback(() => {
    const doLoad = async () => {
      setError(null);
      const response = await server.fetchFile({ id });
      if (response.success) {
        const file = response.data;
        dispatch(cacheFile(file));
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
   * Load file or update cache history on hit.
   */
  useEffect(() => {
    if (file != null) {
      // Cache hit! Update cache history.
      dispatch(cacheFile(file));
    } else {
      // Otherwise trigger file loading.
      loadFile();
    }
  }, [id, file]);

  return {
    file,
    error,
    loadFile,
  };
}

export default useFile;
