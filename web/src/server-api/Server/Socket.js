import EventEmitter from "events";
import { SocketEvent } from "./constants";

/**
 * Event-based message channel to communicate with the server.
 *
 * Defines the following events:
 *  1. "task-update" - fire when background task is updated.
 *  2. "task-delete" - fire when background task is deleted.
 *  3. "logs-update" - fire when logs are updated.
 *  4. "disconnect" - fire on connection loss.
 *  5. "connect" - fire when connection is established.
 */
export default class Socket extends EventEmitter {
  constructor({ socket, transform }) {
    super();
    this._socket = socket;
    this._transform = transform;

    // Handle socket events:

    // Notify listeners on connect
    this._socket.on("connect", () => {
      console.log("Socket Connected.");
      this.emit("connect", this);
    });

    // Notify listeners on disconnection
    this._socket.on("disconnect", () => {
      console.log("Socket Disconnected.");
      this.emit("disconnect", this);
    });

    // Notify listeners on "task-update"
    this._socket.on(SocketEvent.TASK_UPDATED, (data) => {
      this.emit("task-update", this._transform.task(data));
    });

    // Notify listeners on "task-delete"
    this._socket.on(SocketEvent.TASK_DELETED, (taskId) => {
      this.emit("task-delete", taskId);
    });

    // Notify listeners on "log-update"
    this._socket.on(SocketEvent.TASK_LOGS_UPDATED, ({ task_id, data }) => {
      this.emit("logs-update", { taskId: task_id, data });
    });
  }

  subscribeForLogs(taskId, offset = 0) {
    this._socket.emit(SocketEvent.TASK_LOGS_SUBSCRIBE, {
      task_id: taskId,
      offset,
    });
  }

  unsubscribeFromLogs(taskId) {
    this._socket.emit(SocketEvent.TASK_LOGS_UNSUBSCRIBE, { task_id: taskId });
  }

  close() {
    this._socket.close();
  }
}
