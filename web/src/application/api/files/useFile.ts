import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";
import { EntityQueryResults } from "../../common/model";
import { VideoFile } from "../../../model/VideoFile";

/**
 * API to fetch single file.
 */
export type UseFileResults = EntityQueryResults & {
  file?: VideoFile;
};

/**
 * Fetch file by id.
 */
export function useFile(id: VideoFile["id"]): UseFileResults {
  const server = useServer();
  const query = useQuery<VideoFile, Error>(["file", id], () =>
    server.files.get(id)
  );

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
