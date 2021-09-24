import { ServerAPI } from "../ServerAPI";
import axios, { AxiosInstance } from "axios";
import AxiosRetry from "axios-retry";
import PresetEndpoint from "./endpoints/PresetEndpoint";
import FilesEndpoint from "./endpoints/FilesEndpoint";
import MatchesEndpoint from "./endpoints/MatchesEndpoint";
import StatsEndpoint from "./endpoints/StatsEndpoint";
import ExamplesEndpoint from "./endpoints/ExamplesEndpoint";
import TemplatesEndpoint from "./endpoints/TemplatesEndpoint";
import TemplateMatchesEndpoint from "./endpoints/TemplateMatchesEndpoint";
import TemplateExclusionsEndpoint from "./endpoints/TemplateExclusionsEndpoint";
import TasksEndpoint from "./endpoints/TasksEndpoint";
import Socket from "./Socket";

type RestServerOptions = {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  headers?: { [name: string]: string };
};

export default class Server implements ServerAPI {
  readonly baseURL: string;
  readonly axios: AxiosInstance;
  readonly files: FilesEndpoint;
  readonly presets: PresetEndpoint;
  readonly matches: MatchesEndpoint;
  readonly templates: TemplatesEndpoint;
  readonly examples: ExamplesEndpoint;
  readonly templateMatches: TemplateMatchesEndpoint;
  readonly templateExclusions: TemplateExclusionsEndpoint;
  readonly tasks: TasksEndpoint;
  readonly stats: StatsEndpoint;
  readonly socket: Socket;

  constructor(options: RestServerOptions = {}) {
    this.baseURL = options.baseURL || "/api/v1";
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: options.timeout || 10 * 1000,
      headers: options.headers || {},
    });
    AxiosRetry(this.axios, {
      retries: options.retries || 0,
      retryDelay: AxiosRetry.exponentialDelay,
    });
    this.files = new FilesEndpoint(this.axios);
    this.matches = new MatchesEndpoint(this.axios);
    this.presets = new PresetEndpoint(this.axios);
    this.templates = new TemplatesEndpoint(this.axios);
    this.examples = new ExamplesEndpoint(this.axios);
    this.templateMatches = new TemplateMatchesEndpoint(this.axios);
    this.templateExclusions = new TemplateExclusionsEndpoint(this.axios);
    this.tasks = new TasksEndpoint(this.axios);
    this.stats = new StatsEndpoint(this.axios);
    this.socket = new Socket();
  }
}
