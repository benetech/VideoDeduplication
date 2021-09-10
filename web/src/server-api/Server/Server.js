import axios from "axios";
import io from "socket.io-client";
import { SocketNamespace, socketPath } from "./constants";
import Socket from "./Socket";
import AxiosRetry from "axios-retry";
import FilesEndpoint from "./endpoints/FilesEndpoint";
import TasksEndpoint from "./endpoints/TasksEndpoint";
import MatchesEndpoint from "./endpoints/MatchesEndpoint";
import TemplatesEndpoint from "./endpoints/TemplatesEndpoint";
import ExamplesEndpoint from "./endpoints/ExamplesEndpoint";
import TemplateMatchesEndpoint from "./endpoints/TemplateMatchesEndpoint";
import PresetsEndpoint from "./endpoints/PresetsEndpoint";
import TemplateExclusionsEndpoint from "./endpoints/TemplateExclusionsEndpoint";
import StatsEndpoint from "./endpoints/StatsEndpoint";

/**
 * Server API client.
 */
export default class Server {
  constructor({
    baseURL = "/api/v1",
    timeout = 10 * 1000,
    retries = 5,
    headers = {},
  } = {}) {
    this.axios = axios.create({
      baseURL,
      timeout,
      headers,
    });
    AxiosRetry(this.axios, {
      retries,
      retryDelay: AxiosRetry.exponentialDelay,
    });
    this._filesEndpoint = new FilesEndpoint(this.axios);
    this._tasksEndpoint = new TasksEndpoint(this.axios);
    this._matcheEndpoint = new MatchesEndpoint(this.axios);
    this._templatesEndpoint = new TemplatesEndpoint(this.axios);
    this._examplesEndpoint = new ExamplesEndpoint(this.axios);
    this._templateMatchesEndpoint = new TemplateMatchesEndpoint(this.axios);
    this._templateExclusions = new TemplateExclusionsEndpoint(this.axios);
    this._presetsEndpoint = new PresetsEndpoint(this.axios);
    this._statsEndpoint = new StatsEndpoint(this.axios);
    this._socket = null;
  }

  /**
   * Files endpoint.
   * @return {FilesEndpoint}
   */
  get files() {
    return this._filesEndpoint;
  }

  /**
   * Tasks endpoint.
   * @return {TasksEndpoint}
   */
  get tasks() {
    return this._tasksEndpoint;
  }

  /**
   * Matches endpoint.
   * @return {MatchesEndpoint}
   */
  get matches() {
    return this._matcheEndpoint;
  }

  /**
   * Templates endpoint.
   * @return {TemplatesEndpoint}
   */
  get templates() {
    return this._templatesEndpoint;
  }

  /**
   * Examples endpoint.
   * @return {ExamplesEndpoint}
   */
  get examples() {
    return this._examplesEndpoint;
  }

  /**
   * Template matches endpoint.
   * @return {TemplateMatchesEndpoint}
   */
  get templateMatches() {
    return this._templateMatchesEndpoint;
  }

  /**
   * Template exclusions endpoint.
   * @return {TemplateExclusionsEndpoint}
   */
  get templateExclusions() {
    return this._templateExclusions;
  }

  /**
   * Presets endpoint.
   * @return {PresetsEndpoint}
   */
  get presets() {
    return this._presetsEndpoint;
  }

  /**
   * Statistics endpoint.
   * @return {StatsEndpoint}
   */
  get stats() {
    return this._statsEndpoint;
  }

  /**
   * Get web-socket.
   * @return {Socket}
   */
  get socket() {
    if (this._socket == null) {
      const socketio = io(SocketNamespace.TASKS, {
        path: socketPath,
      });
      this._socket = new Socket({
        socket: socketio,
        transform: this.tasks.transform,
      });
    }
    return this._socket;
  }

  /**
   * Open a new connection for dynamic messaging.
   * @return {Socket}
   */
  openMessageChannel() {
    const socketio = io(SocketNamespace.TASKS, {
      path: socketPath,
    });
    return new Socket({
      socket: socketio,
      transform: this.tasks.transform,
    });
  }
}
