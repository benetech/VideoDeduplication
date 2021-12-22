import { useQuery } from "react-query";
import { useServer } from "../../server-api/context";

/**
 * Hook for retrieving online status.
 */
export default function useOnline(): boolean {
  const server = useServer();
  const query = useQuery<boolean>(["online"], () => server.isOnline());
  return query.data == null ? false : query.data;
}
