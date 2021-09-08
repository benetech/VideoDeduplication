import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";

/**
 * Fetch file by id.
 * @param {string|number} id
 * @return {{
 *   file: FileEntity,
 *   error: Error,
 *   isLoading: boolean,
 *   isError: boolean,
 *   isSuccess: boolean,
 *   refetch: function
 * }}
 */
export function useFile(id) {
  const server = useServer();
  const query = useQuery(["file", id], () => server.files.get(id));

  return {
    file: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}

export default useFile;
