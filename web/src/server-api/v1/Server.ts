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
import RepositoryEndpoint from "./endpoints/RepositoryEndpoint";
import ContributorsEndpoint from "./endpoints/ContributorsEndpoint";
import { makeServerError } from "../ServerError";
import { OnlineDTO } from "./dto/online";
import { ServerHealthStatus } from "../../model/health";
import { HealthDTO } from "./dto/health";
import EmbeddingsEndpoint from "./endpoints/EmbeddingsEndpoint";

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
  readonly repositories: RepositoryEndpoint;
  readonly contributors: ContributorsEndpoint;
  readonly stats: StatsEndpoint;
  readonly socket: Socket;
  readonly embeddings: EmbeddingsEndpoint;

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
    this.repositories = new RepositoryEndpoint(this.axios);
    this.contributors = new ContributorsEndpoint(this.axios);
    this.stats = new StatsEndpoint(this.axios);
    this.embeddings = new EmbeddingsEndpoint(this.axios);
    this.socket = new Socket();
  }

  async isOnline(): Promise<boolean> {
    try {
      const response = await this.axios.get<OnlineDTO>("/online");
      return response.data.online;
    } catch (error) {
      throw makeServerError("Fetch online status error.", error);
    }
  }

  async getHealth(): Promise<ServerHealthStatus> {
    try {
      const response = await this.axios.get<HealthDTO>("/health");
      return {
        semanticSearch: response.data.semantic_search,
      };
    } catch (error) {
      throw makeServerError("Fetch health status error.", error);
    }
  }
}
