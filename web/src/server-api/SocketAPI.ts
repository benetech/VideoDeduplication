import { EventEmitter } from "events";
import { Task } from "../model/Task";

/**
 * Socket message types.
 */
export enum MessageTypes {
  TASK_UPDATED = "task-update",
  TASK_DELETE = "task-delete",
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
export interface SocketAPI extends EventEmitter {
  on(event: MessageTypes.TASK_UPDATED, listener: (task: Task) => void);
  on(event: MessageTypes.TASK_DELETE, listener: (taskId: Task["id"]) => void);
  on(event: MessageTypes.LOGS_UPDATE, listener: (message: LogsUpdate) => void);
  subscribeForLogs(task: Task | Task["id"], offset: number);
  unsubscribeFromLogs(task: Task | Task["id"]);
  close();
}
