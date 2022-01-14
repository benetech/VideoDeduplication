import { Contributor } from "../../../model/VideoFile";
import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";

export type UseContributorResults = {
  contributor?: Contributor;
  error: Error | null;
  load: () => void;
};

export default function useContributor(
  id: Contributor["id"]
): UseContributorResults {
  const server = useServer();
  const query = useQuery<Contributor, Error>(["contributor", id], () =>
    server.contributors.get(id)
  );

  return {
    contributor: query.data,
    error: query.error,
    load: query.refetch,
  };
}
