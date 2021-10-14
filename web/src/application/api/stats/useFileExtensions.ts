import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";
import { ExtensionsStats } from "../../../model/Stats";

export const DefaultExtensions = [
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
export default function useFileExtensions(initial?: string[]): string[] {
  const server = useServer();
  const query = useQuery<ExtensionsStats>(["statistics", "extensions"], () =>
    server.stats.extensions()
  );

  return query.data?.extensions || initial || DefaultExtensions;
}
