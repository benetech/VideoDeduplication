import { useQuery } from "react-query";
import { useServer } from "../../server-api/context";
import { ServerHealthStatus } from "../../model/health";
import { Nullable } from "../../lib/types/util-types";

/**
 * Hook for retrieving online status.
 */
export default function useHealth(): Nullable<ServerHealthStatus> {
  const server = useServer();
  const query = useQuery<ServerHealthStatus>(["health"], () =>
    server.getHealth()
  );
  return query.data;
}
