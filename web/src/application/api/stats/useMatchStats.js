import { useEffect, useState } from "react";
import { useServer } from "../../../server-api/context";

/**
 * Hook for retrieving matches statistics.
 */
export default function useMatchStats() {
  const server = useServer();
  const [stats, setStats] = useState({ unique: 0, related: 0, duplicates: 0 });

  useEffect(() => {
    server.fetchFiles({ limit: 0 }).then(({ counts }) => {
      setStats({
        unique: counts.unique,
        related: counts.related,
        duplicates: counts.duplicates,
      });
    });
  }, []);

  return stats;
}
