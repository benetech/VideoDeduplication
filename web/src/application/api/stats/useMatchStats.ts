import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";
import { MatchCounts } from "../../../model/Match";

export type CountsData = {
  counts: MatchCounts;
};

const DefaultCounts: MatchCounts = {
  all: 0,
  unique: 0,
  related: 0,
  duplicates: 0,
};

/**
 * Hook for retrieving matches statistics.
 */
export default function useMatchStats(): MatchCounts {
  const server = useServer();
  const query = useQuery<CountsData>(["statistics", "match-counts"], () =>
    server.files.list({ limit: 0 })
  );

  return query.data?.counts || DefaultCounts;
}
