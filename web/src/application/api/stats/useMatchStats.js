import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";
import Statistics from "./Statistics";

/**
 * Hook for retrieving matches statistics.
 */
export default function useMatchStats() {
  const server = useServer();
  const query = useQuery(
    ["statistics", Statistics.extensions],
    () => server.files.list({ limit: 0 }),
    { initialData: { counts: { unique: 0, related: 0, duplicates: 0 } } }
  );

  return query.data.counts;
}
