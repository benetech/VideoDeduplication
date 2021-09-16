import { Preset, PresetFilters } from "../model/Preset";
import { Entity, Transient, Updates } from "../lib/entity/Entity";
import {
  ClusterFilters,
  FileFilters,
  FrameDescriptor,
  VideoFile,
} from "../model/VideoFile";
import { Match, MatchCounts } from "../model/Match";
import { Task, TaskFilters, TaskRequest } from "../model/Task";
import {
  Template,
  TemplateExample,
  TemplateExampleFilters,
  TemplateExclusion,
  TemplateExclusionFilters,
  TemplateFilters,
  TemplateMatch,
  TemplateMatchFilters,
} from "../model/Template";
import { SocketAPI } from "./SocketAPI";

/**
 * Generic params to list multiple entities.
 */
export type ListParams<Filters> = {
  limit?: number;
  offset?: number;
  fields?: string[];
  filters?: Filters;
};

/**
 * List entities results.
 */
export type ListResults<T, Filters> = {
  request: ListParams<Filters>;
  total: number;
  items: T[];
};

/**
 * Reusable type for read-only API endpoint.
 */
export interface ReadOnlyEndpoint<E extends Entity, Filters> {
  get(id: E["id"]): Promise<E>;
  list(params?: ListParams<Filters>): Promise<ListResults<E, Filters>>;
}

/**
 * Read/write API endpoint.
 */
export interface Endpoint<E extends Entity, Filters>
  extends ReadOnlyEndpoint<E, Filters> {
  create(entity: Transient<E>): Promise<E>;
  update(entity: Updates<E>): Promise<E>;
  delete(entity: E | E["id"]): Promise<void>;
}

/**
 * File query results.
 */
export type ListFilesResults = ListResults<VideoFile, FileFilters> & {
  counts: MatchCounts;
};

/**
 * Query file cluster results.
 */
export type QueryClusterResults = {
  request: ListParams<ClusterFilters>;
  total: number;
  files: VideoFile[];
  matches: Match[];
};

/**
 * Files API endpoint.
 */
export interface FilesAPI extends ReadOnlyEndpoint<VideoFile, FileFilters> {
  list(params?: ListParams<FileFilters>): Promise<ListFilesResults>;
  cluster(params?: ListParams<FileFilters>): Promise<QueryClusterResults>;
}

/**
 * Matches API endpoint.
 */
export interface MatchesAPI {
  update(entity: Updates<Match>): Promise<Match>;
}

/**
 * Presets API endpoint.
 */
export type PresetsAPI = Endpoint<Preset, PresetFilters>;

/**
 * Tasks API endpoint.
 */
export interface TasksAPI extends ReadOnlyEndpoint<Task, TaskFilters> {
  create(request: TaskRequest): Promise<Task>;
  delete(task: Task | Task["id"]): Promise<void>;
  cancel(task: Task | Task["id"]): Promise<Task>;
  logs(task: Task | Task["id"]): Promise<string>;
}

/**
 * Templates API endpoint.
 */
export type TemplatesAPI = Endpoint<Template, TemplateFilters>;

/**
 * Request params to create template example from video frame.
 */
export type FrameToExampleParams = FrameDescriptor & {
  template: Template;
};

/**
 * Template examples API endpoint.
 */
export interface TemplateExamplesAPI
  extends ReadOnlyEndpoint<TemplateExample, TemplateExampleFilters> {
  createFromFrame(params: FrameToExampleParams): Promise<TemplateExample>;
  delete(example: TemplateExample | TemplateExample["id"]): Promise<void>;
  upload(template: Template, file: File): Promise<TemplateExample>;
}

/**
 * Results of template-matches query.
 */
export type ListTemplateMatchesResults = ListResults<
  TemplateMatch,
  TemplateMatchFilters
> & {
  templates: Template[];
  files: VideoFile[];
};

/**
 * Template matches API endpoint.
 */
export interface TemplateMatchesAPI
  extends ReadOnlyEndpoint<TemplateMatch, TemplateMatchFilters> {
  list(
    params?: ListParams<TemplateMatchFilters>
  ): Promise<ListTemplateMatchesResults>;
  update(entity: Updates<TemplateMatch>): Promise<TemplateMatch>;
  delete(entity: TemplateMatch | TemplateMatch["id"]): Promise<void>;
}

/**
 * Template exclusions API endpoint.
 */
export interface TemplateExclusionsAPI
  extends ReadOnlyEndpoint<TemplateExclusion, TemplateExclusionFilters> {
  create(exclusion: Transient<TemplateExclusion>): Promise<TemplateExclusion>;
  delete(task: TemplateExclusion | TemplateExclusion["id"]): Promise<void>;
}

/**
 * Statistics options.
 */
export type GetStatsOptions = {
  name: string;
};

/**
 * Statistics API endpoint.
 */
export interface StatsAPI {
  get(options: GetStatsOptions): Promise<any>;
}

export interface ServerAPI {
  readonly files: FilesAPI;
  readonly presets: PresetsAPI;
  readonly tasks: TasksAPI;
  readonly matches: MatchesAPI;
  readonly templates: TemplatesAPI;
  readonly examples: TemplateExamplesAPI;
  readonly templateMatches: TemplateMatchesAPI;
  readonly templateExclusions: TemplateExclusionsAPI;
  readonly stats: StatsAPI;
  readonly socket: SocketAPI;
}
