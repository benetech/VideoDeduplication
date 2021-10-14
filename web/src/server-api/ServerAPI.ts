import { Preset, PresetFilters } from "../model/Preset";
import { Entity, Transient, Updates } from "../lib/entity/Entity";
import {
  ClusterFilters,
  FileFilters,
  FrameDescriptor,
  VideoFile,
} from "../model/VideoFile";
import {
  FileMatch,
  Match,
  MatchCounts,
  MatchQueryFilters,
} from "../model/Match";
import { Task, TaskFilters, TypedTaskRequest } from "../model/Task";
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
import { ExtensionsStats } from "../model/Stats";

/**
 * Generic request to list multiple entities.
 */
export type ListRequest<Filters> = {
  limit: number;
  offset: number;
  fields: string[];
  filters: Filters;
};

/**
 * Generic options to list multiple entities.
 */
export type ListOptions<Filters> = Partial<ListRequest<Filters>>;

/**
 * The most common list results attributes.
 */
export type BaseListResults<Filters = unknown> = {
  request: ListRequest<Filters>;
  total: number;
};

/**
 * List entities results.
 */
export type ListResults<
  E extends Entity,
  Filters = unknown
> = BaseListResults<Filters> & {
  items: E[];
};

/**
 * Reusable type for read-only API endpoint.
 */
export interface ReadOnlyEndpoint<E extends Entity, Filters> {
  get(id: E["id"], fields?: string[]): Promise<E>;
  list(params?: ListOptions<Filters>): Promise<ListResults<E, Filters>>;
}

/**
 * Alias for tasks query results.
 */
export type ListTasksResults = ListResults<Task, TaskFilters>;

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

export type QueryClusterOptions = ListOptions<ClusterFilters> & {
  fileId: number;
};

export type QueryClusterRequest = ListRequest<ClusterFilters> & {
  fileId: number;
};

/**
 * Query file cluster results.
 */
export type QueryClusterResults = BaseListResults<ClusterFilters> & {
  request: QueryClusterRequest;
  files: VideoFile[];
  matches: Match[];
};

export type QueryFileMatchesOptions = ListOptions<MatchQueryFilters> & {
  fileId: number;
};

export type QueryFileMatchesRequest = ListRequest<MatchQueryFilters> & {
  fileId: number;
};

export type QueryFileMatchesResults = ListResults<
  FileMatch,
  MatchQueryFilters
> & {
  request: QueryFileMatchesRequest;
};

/**
 * Files API endpoint.
 */
export interface FilesAPI extends ReadOnlyEndpoint<VideoFile, FileFilters> {
  list(params?: ListOptions<FileFilters>): Promise<ListFilesResults>;
  cluster(params?: QueryClusterOptions): Promise<QueryClusterResults>;
  matches(params?: QueryFileMatchesOptions): Promise<QueryFileMatchesResults>;
  probeVideo(id: number): Promise<void>;
}

/**
 * Matches API endpoint.
 */
export interface MatchesAPI {
  update(match: Updates<FileMatch> | Updates<Match>): Promise<Match>;
}

/**
 * Presets API endpoint.
 */
export type PresetsAPI = Endpoint<Preset, PresetFilters>;

/**
 * Tasks API endpoint.
 */
export interface TasksAPI extends ReadOnlyEndpoint<Task, TaskFilters> {
  create(request: TypedTaskRequest): Promise<Task>;
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
    params?: ListOptions<TemplateMatchFilters>
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
 * Statistics API endpoint.
 */
export interface StatsAPI {
  extensions(): Promise<ExtensionsStats>;
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
