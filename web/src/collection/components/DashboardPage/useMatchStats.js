import { useEffect, useState } from "react";
import { useServer } from "../../../server-api/context";

/**
 * Hook for retrieving matches statistics.
 */
export default function useMatchStats() {
  const server = useServer();
  const [stats, setStats] = useState({ unique: 0, related: 0, duplicates: 0 });

  useEffect(() => {
    server.fetchFiles({ limit: 0 }).then((response) => {
      if (response.success) {
        const counts = response.data.counts;
        setStats({
          unique: counts.unique,
          related: counts.related - counts.duplicates,
          duplicates: counts.duplicates,
        });
      }
    });
  }, []);

  return stats;
}
