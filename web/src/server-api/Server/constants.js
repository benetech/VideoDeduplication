// Task-related Socket.io events.
export const SocketEvent = {
  TASK_UPDATED: "TASK_UPDATED",
  TASK_DELETED: "TASK_DELETED",
  TASK_LOGS_UPDATED: "TASK_LOGS_UPDATED",
  TASK_LOGS_SUBSCRIBE: "TASK_LOGS_SUBSCRIBE",
  TASK_LOGS_UNSUBSCRIBE: "TASK_LOGS_UNSUBSCRIBE",
};

// Socket.io namespaces
export const SocketNamespace = {
  TASKS: "/tasks",
};

export const socketPath = "/api/v1/socket.io";
