import { useServer } from "../../../server-api/context";
import { useEffect } from "react";
import useUpdateTaskData from "./useUpdateTaskData";
import useDeleteTaskData from "./useDeleteTaskData";

export default function useHandleTaskEvents() {
  const server = useServer();
  const updateTaskData = useUpdateTaskData();
  const deleteTaskData = useDeleteTaskData();

  useEffect(() => {
    const socket = server.socket;
    socket.on("task-update", updateTaskData);
    socket.on("task-delete", deleteTaskData);

    return () => {
      socket.off("task-update", updateTaskData);
      socket.off("task-delete", deleteTaskData);
    };
  }, []);
}
