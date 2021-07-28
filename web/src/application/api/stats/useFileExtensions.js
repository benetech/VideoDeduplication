import { useServer } from "../../../server-api/context";
import { useEffect, useState } from "react";
import Statistics from "./Statistics";

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
  const [extensions, setExtensions] = useState(initial || defaultExtensions);

  useEffect(() => {
    server
      .fetchStats({ name: Statistics.extensions })
      .then((results) => {
        setExtensions(results);
      })
      .catch((error) => {
        console.error("Error fetching file extensions", error, { error });
        setExtensions(initial || defaultExtensions);
      });
  }, []);

  return extensions;
}
