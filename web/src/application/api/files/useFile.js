import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCachedFile } from "../../state/root/selectors";
import { useServer } from "../../../server-api/context";
import { cacheFile } from "../../state/files/fileCache/actions";
import ServerError from "../../../server-api/Server/ServerError";

/**
 * Fetch file by id.
 * @param {string|number} id
 * @return {{
 *   file: FileEntity,
 *   error: boolean,
 *   loadFile: function
 * }}
 */
export function useFile(id) {
  const file = useSelector(selectCachedFile(id));
  const [error, setError] = useState(null);
  const server = useServer();
  const dispatch = useDispatch();

  const loadFile = useCallback(() => {
    const doLoad = async () => {
      setError(null);
      const file = await server.files.get(id);
      dispatch(cacheFile(file));
    };

    doLoad().catch((error) => {
      console.error(error);
      setError({ status: error.code || ServerError.CLIENT_ERROR });
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
