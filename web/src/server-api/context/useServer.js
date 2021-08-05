import { useContext } from "react";
import ServerContext from "./ServerContext";

/**
 * Hook to obtain Server API client.
 * @return {Server} server API client
 */
export default function useServer() {
  const server = useContext(ServerContext);
  if (server == null) {
    throw new Error("Forgot to wrap component in ServerProvider");
  }
  return server;
}
