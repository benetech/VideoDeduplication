import React from "react";
import { ServerAPI } from "../ServerAPI";

/**
 * Context providing access to REST API Facade (Server)
 */
export const ServerContext: React.Context<ServerAPI | null> =
  React.createContext<ServerAPI | null>(null);

export default ServerContext;
