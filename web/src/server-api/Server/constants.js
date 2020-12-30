// Task-related Socket.io events.
export const SocketEvent = {
  TASK_UPDATED: "TASK_UPDATED",
  TASK_DELETED: "TASK_DELETED",
};

// Socket.io namespaces
export const SocketNamespace = {
  TASKS: "/tasks",
};

export const socketPath = "/api/v1/socket.io";