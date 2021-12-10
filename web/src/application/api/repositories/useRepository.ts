import { Repository } from "../../../model/VideoFile";
import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";

export type UseRepositoryResults = {
  repository?: Repository;
  error: Error | null;
  load: () => void;
};

export default function useRepository(
  id: Repository["id"]
): UseRepositoryResults {
  const server = useServer();
  const query = useQuery<Repository, Error>(["repository", id], () =>
    server.repositories.get(id)
  );

  return {
    repository: query.data,
    error: query.error,
    load: query.refetch,
  };
}
