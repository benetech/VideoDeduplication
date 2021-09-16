import { useContext } from "react";
import ServerContext from "./ServerContext";
import { ServerAPI } from "../ServerAPI";

/**
 * Hook to obtain Server API client.
 */
export default function useServer(): ServerAPI {
  const server = useContext(ServerContext);
  if (server == null) {
    throw new Error("Forgot to wrap component in ServerProvider");
  }
  return server;
}
