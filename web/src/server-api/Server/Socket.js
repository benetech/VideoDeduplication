import EventEmitter from "events";
import { SocketEvent } from "./constants";

/**
 * Event-based message channel to communicate with the server.
 *
 * Defines the following events:
 *  1. "task-update" - fire when background task is updated.
 *  2. "task-delete" - fire when background task is deleted.
 */
export default class Socket extends EventEmitter {
  constructor({ socket, transform }) {
    super();
    this._socket = socket;
    this._transform = transform;

    // Handle socket events:

    // Log connect/disconnect
    this._socket.on("connect", () => console.log("Socket Connected."));
    this._socket.on("disconnect", () => console.log("Socket Disconnected."));

    // Notify listeners on "task-update"
    this._socket.on(SocketEvent.TASK_UPDATED, (data) => {
      this.emit("task-update", this._transform.task(data));
    });

    // Notify listeners on "task-delete"
    this._socket.on(SocketEvent.TASK_DELETED, (taskId) => {
      this.emit("task-delete", taskId);
    });
  }

  close() {
    this._socket.close();
  }
}
