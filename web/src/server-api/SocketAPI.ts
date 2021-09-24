import { Task } from "../model/Task";

/**
 * Socket message types.
 */
export enum SocketEvents {
  TASK_UPDATED = "task-update",
  TASK_DELETED = "task-delete",
  LOGS_UPDATE = "logs-update",
  DISCONNECT = "disconnect",
  CONNECT = "connect",
}

/**
 * Task logs update message.
 */
export type LogsUpdate = {
  taskId: Task["id"];
  data: string;
};

/**
 * Real-time messaging API.
 */
export interface SocketAPI {
  on(event: SocketEvents.TASK_UPDATED, listener: (task: Task) => void);
  on(event: SocketEvents.TASK_DELETED, listener: (taskId: Task["id"]) => void);
  on(event: SocketEvents.LOGS_UPDATE, listener: (message: LogsUpdate) => void);
  on(event: SocketEvents.DISCONNECT, listener: () => void);
  on(event: SocketEvents.CONNECT, listener: () => void);
  off(event: SocketEvents, listener: (...args: any[]) => void);
  subscribeForLogs(task: Task | Task["id"], offset?: number);
  unsubscribeFromLogs(task: Task | Task["id"]);
  close();
}
