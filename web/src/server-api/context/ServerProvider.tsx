import React from "react";
import ServerContext from "./ServerContext";
import { ServerAPI } from "../ServerAPI";

type ServerProviderProps = {
  server: ServerAPI;
  children: React.ReactNode;
};

export default function ServerProvider(
  props: ServerProviderProps
): JSX.Element {
  const { server, children } = props;
  return (
    <ServerContext.Provider value={server}>{children}</ServerContext.Provider>
  );
}
