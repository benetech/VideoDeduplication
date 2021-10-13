import { SocketAPI, SocketEvents } from "../SocketAPI";
import { io, Socket as SocketIO } from "socket.io-client";
import TasksTransformer from "./transform/TasksTransformer";
import { Task } from "../../model/Task";
import getEntityId from "../../lib/entity/getEntityId";
import { EventEmitter } from "events";
import { LogsUpdateMessageDTO, TaskDTO } from "./dto/tasks";

/**
 * Available Socket.io namespaces.
 */
enum SocketNamespace {
  TASKS = "/tasks",
}

/**
 * Message types used by backend.
 */
enum InternalSocketEvents {
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DELETED = "TASK_DELETED",
  TASK_LOGS_UPDATED = "TASK_LOGS_UPDATED",
  TASK_LOGS_SUBSCRIBE = "TASK_LOGS_SUBSCRIBE",
  TASK_LOGS_UNSUBSCRIBE = "TASK_LOGS_UNSUBSCRIBE",
  CONNECT = "connect",
  DISCONNECT = "disconnect",
}

export const socketPath = "/api/v1/socket.io";

function defaultSocket(): SocketIO {
  return io(SocketNamespace.TASKS, {
    path: socketPath,
  });
}

/**
 * Event-based message channel to communicate with the server.
 */
export default class Socket extends EventEmitter implements SocketAPI {
  private readonly socket: SocketIO;
  private readonly taskTransform: TasksTransformer;

  constructor(socket?: SocketIO, taskTransform?: TasksTransformer) {
    super();
    this.socket = socket || defaultSocket();
    this.taskTransform = taskTransform || new TasksTransformer();

    this.socket.on(InternalSocketEvents.CONNECT, () => {
      console.log("Socket Connected.");
      this.emit(SocketEvents.CONNECT, this);
    });

    this.socket.on(InternalSocketEvents.DISCONNECT, () => {
      console.log("Socket Disconnected.");
      this.emit(SocketEvents.DISCONNECT, this);
    });

    this.socket.on(InternalSocketEvents.TASK_UPDATED, (data: TaskDTO) => {
      this.emit(SocketEvents.TASK_UPDATED, this.taskTransform.task(data));
    });

    this.socket.on(
      InternalSocketEvents.TASK_DELETED,
      (taskId: TaskDTO["id"]) => {
        this.emit(SocketEvents.TASK_DELETED, taskId);
      }
    );

    this.socket.on(
      InternalSocketEvents.TASK_LOGS_UPDATED,
      ({ task_id, data }: LogsUpdateMessageDTO) => {
        this.emit(SocketEvents.LOGS_UPDATE, { taskId: task_id, data });
      }
    );
  }

  subscribeForLogs(task: Task | Task["id"], offset = 0): void {
    this.socket.emit(InternalSocketEvents.TASK_LOGS_SUBSCRIBE, {
      task_id: getEntityId(task),
      offset,
    });
  }

  unsubscribeFromLogs(task: Task | Task["id"]): void {
    this.socket.emit(InternalSocketEvents.TASK_LOGS_UNSUBSCRIBE, {
      task_id: getEntityId(task),
    });
  }

  close(): void {
    this.socket.close();
  }
}
