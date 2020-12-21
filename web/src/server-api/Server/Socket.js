import EventEmitter from "events";
import { SocketEvent } from "./constants";

/**
 * Event-based message channel to communicate with the server.
 *
 * Defines the following events:
 *  1. "task-update" - fire when background task is updated.
 */
export default class Socket extends EventEmitter {
  constructor({ socket, transform }) {
    super();
    this._socket = socket;
    this._transform = transform;

    // Handle socket events:

    // Notify listeners on "task-update"
    this._socket.on(SocketEvent.TASK_UPDATED, (data) => {
      this.emit("task-update", this._transform.task(data));
    });
  }

  close() {
    this._socket.close();
  }
}
