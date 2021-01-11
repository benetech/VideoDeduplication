import { useEffect, useState } from "react";
import { useServer } from "../../../server-api/context";
import { useTheme } from "@material-ui/core";

/**
 * Hook for retrieving matches statistics.
 */
export default function useMatchStats() {
  const theme = useTheme();
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

  return [
    {
      name: "Duplicates",
      value: stats.duplicates,
      color: theme.palette.primary.main,
    },
    {
      name: "Possibly related",
      value: stats.related,
      color: theme.palette.primary.light,
    },
    {
      name: "Unique files",
      value: stats.unique,
      color: "#131726",
    },
  ];
}
