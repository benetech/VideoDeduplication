import { useServer } from "../../../server-api/context";
import Statistics from "./Statistics";
import { useQuery } from "react-query";

export const defaultExtensions = [
  "MP4",
  "AVI",
  "FLV",
  "WMV",
  "MOV",
  "MP3",
  "WEBM",
  "OGG",
];

/**
 * React hook to get file extensions.
 */
export default function useFileExtensions(initial) {
  const server = useServer();
  const query = useQuery(
    ["statistics", Statistics.extensions],
    () => server.stats.get({ name: Statistics.extensions }),
    { initialData: initial || defaultExtensions }
  );

  return query.data;
}
