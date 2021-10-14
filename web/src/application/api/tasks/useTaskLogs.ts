import { useServer } from "../../../server-api/context";
import { useEffect, useState } from "react";
import isActiveTask from "./helpers/isActiveTask";
import { Task } from "../../../model/Task";
import { LogsUpdate, SocketEvents } from "../../../server-api/SocketAPI";

/**
 * Task logs fetch results.
 */
export type UseTaskLogsResults = {
  logs: string[];
  hasMore: boolean;
};

/**
 * Get task logs.
 */
export default function useTaskLogs(task: Task): UseTaskLogsResults {
  const server = useServer();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const socket = server.socket;
    const handleLogs = (newLogs: LogsUpdate) => {
      if (newLogs.taskId === task.id) {
        setLogs((currentLogs) => [...currentLogs, newLogs.data]);
      }
    };
    socket.subscribeForLogs(task);
    socket.on(SocketEvents.LOGS_UPDATE, handleLogs);
    return () => {
      socket.unsubscribeFromLogs(task);
      socket.off(SocketEvents.LOGS_UPDATE, handleLogs);
    };
  }, [task.id]);

  return {
    logs,
    hasMore: isActiveTask(task),
  };
}
