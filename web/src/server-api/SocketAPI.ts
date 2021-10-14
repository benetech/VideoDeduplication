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
  on(event: SocketEvents.TASK_UPDATED, listener: (task: Task) => void): void;
  on(
    event: SocketEvents.TASK_DELETED,
    listener: (taskId: Task["id"]) => void
  ): void;
  on(
    event: SocketEvents.LOGS_UPDATE,
    listener: (message: LogsUpdate) => void
  ): void;
  on(event: SocketEvents.DISCONNECT, listener: () => void): void;
  on(event: SocketEvents.CONNECT, listener: () => void): void;
  off(event: SocketEvents, listener: (...args: any[]) => void): void;
  subscribeForLogs(task: Task | Task["id"], offset?: number): void;
  unsubscribeFromLogs(task: Task | Task["id"]): void;
  close(): void;
}
