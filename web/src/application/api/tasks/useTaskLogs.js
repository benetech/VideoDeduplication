import { useServer } from "../../../server-api/context";
import { useEffect, useState } from "react";
import isActiveTask from "./helpers/isActiveTask";

/**
 * Get task logs.
 * @param {TaskEntity} task
 * @return {{
 *   logs: string[],
 *   hasMore: boolean,
 * }} task logs
 */
export default function useTaskLogs(task) {
  const server = useServer();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const socket = server.socket;
    const handleLogs = (newLogs) =>
      setLogs((currentLogs) => [...currentLogs, newLogs.data]);
    socket.subscribeForLogs(task.id);
    socket.on("logs-update", handleLogs);
    return () => {
      socket.unsubscribeFromLogs(task.id);
      socket.off("logs-update", handleLogs);
    };
  }, [task.id]);

  return {
    logs,
    hasMore: isActiveTask(task),
  };
}
