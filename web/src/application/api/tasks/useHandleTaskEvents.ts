import { useServer } from "../../../server-api/context";
import { useEffect } from "react";
import useUpdateTaskData from "./useUpdateTaskData";
import useDeleteTaskData from "./useDeleteTaskData";
import { SocketEvents } from "../../../server-api/SocketAPI";

export default function useHandleTaskEvents(): void {
  const server = useServer();
  const updateTaskData = useUpdateTaskData();
  const deleteTaskData = useDeleteTaskData();

  useEffect(() => {
    const socket = server.socket;
    socket.on(SocketEvents.TASK_UPDATED, updateTaskData);
    socket.on(SocketEvents.TASK_DELETED, deleteTaskData);

    return () => {
      socket.off(SocketEvents.TASK_UPDATED, updateTaskData);
      socket.off(SocketEvents.TASK_DELETED, deleteTaskData);
    };
  }, []);
}
