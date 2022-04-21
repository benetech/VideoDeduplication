import { JsonObject } from "../lib/types/Json";
import { Repository } from "./VideoFile";
import { EmbeddingAlgorithm } from "./embeddings";

/**
 * Task query filters.
 */
export type TaskFilters = {
  status?: TaskStatus[];
  type?: TaskRequestType[];
};

/**
 * Known task request types.
 */
export enum TaskRequestType {
  DIRECTORY = "ProcessDirectory",
  FILE_LIST = "ProcessFileList",
  MATCH_TEMPLATES = "MatchTemplates",
  FIND_FRAME = "FindFrame",
  PROCESS_ONLINE_VIDEO = "ProcessOnlineVideo",
  PUSH_FINGERPRINTS = "PushFingerprints",
  PULL_FINGERPRINTS = "PullFingerprints",
  MATCH_REMOTE_FINGERPRINTS = "MatchRemoteFingerprints",
  PREPARE_SEMANTIC_SEARCH = "PrepareSemanticSearch",
  GENERATE_TILES = "GenerateTiles",
}

/**
 * Background task request.
 */
export type TypedTaskRequest = {
  type: TaskRequestType;
};

/**
 * Common background task configuration.
 */
export type TaskConfig = {
  frameSampling?: number;
  matchDistance?: number;
  filterDark?: boolean;
  darkThreshold?: number;
  minDuration?: number;
  extensions?: string[];
  saveFrames?: boolean;
};

/**
 * Base type for most of the task requests.
 */
export type BaseTaskRequest = TypedTaskRequest & TaskConfig;

export type ProcessDirectoryRequest = BaseTaskRequest & {
  type: TaskRequestType.DIRECTORY;
  directory: string;
};

export type ProcessFileListRequest = BaseTaskRequest & {
  type: TaskRequestType.FILE_LIST;
  files: string[];
};

export type MatchTemplatesRequest = BaseTaskRequest & {
  type: TaskRequestType.MATCH_TEMPLATES;
  templateDistance?: number;
  templateDistanceMin?: number;
};

export type FindFrameRequest = BaseTaskRequest & {
  type: TaskRequestType.FIND_FRAME;
  fileId: number;
  frameTimeMillis: number;
  directory?: string;
  templateDistance?: number;
  templateDistanceMin?: number;
};

export type ProcessOnlineVideoRequest = BaseTaskRequest & {
  type: TaskRequestType.PROCESS_ONLINE_VIDEO;
  urls: string[];
  destinationTemplate?: string;
};

export type PushFingerprintsRequest = {
  type: TaskRequestType.PUSH_FINGERPRINTS;
  repositoryId: Repository["id"];
};

export type PullFingerprintsRequest = {
  type: TaskRequestType.PULL_FINGERPRINTS;
  repositoryId: Repository["id"];
};

export type MatchRemoteFingerprintsRequest = {
  type: TaskRequestType.MATCH_REMOTE_FINGERPRINTS;
  repositoryId?: Repository["id"] | null;
  contributorName?: string | null;
};

export type PrepareSemanticSearchRequest = {
  type: TaskRequestType.PREPARE_SEMANTIC_SEARCH;
  force: boolean;
};

export type GenerateTilesRequest = {
  type: TaskRequestType.GENERATE_TILES;
  algorithm: EmbeddingAlgorithm;
  maxZoom: number;
  force: boolean;
};

export type TaskRequest =
  | ProcessDirectoryRequest
  | ProcessFileListRequest
  | MatchTemplatesRequest
  | FindFrameRequest
  | ProcessOnlineVideoRequest
  | PushFingerprintsRequest
  | PullFingerprintsRequest
  | MatchRemoteFingerprintsRequest
  | PrepareSemanticSearchRequest
  | GenerateTilesRequest;

export type FileCount = {
  templateId: number;
  fileCount: number;
};

export type FoundFrame = {
  fileId: number;
  startMs: number;
  endMs: number;
};

export type ProcessedFile = {
  id: number;
  path: string;
};

export type ProcessDirectoryResult = undefined;
export type ProcessFileListResult = undefined;
export type MatchTemplatesResult = { fileCounts: FileCount[] };
export type FindFrameResult = { matches: FoundFrame[] };
export type ProcessOnlineVideoResult = { files: ProcessedFile[] };
export type PushFingerprintsResult = undefined;
export type PullFingerprintsResult = undefined;
export type MatchRemoteFingerprintsResult = undefined;
export type PrepareSemanticSearchResult = undefined;
export type GenerateTilesResult = undefined;

export type TaskResult =
  | ProcessDirectoryResult
  | ProcessFileListResult
  | MatchTemplatesResult
  | FindFrameResult
  | ProcessOnlineVideoResult
  | GenerateTilesResult;

/**
 * Task type to request type mapping.
 */
export type TaskRequestMap = {
  [TaskRequestType.DIRECTORY]: ProcessDirectoryRequest;
  [TaskRequestType.FILE_LIST]: ProcessFileListRequest;
  [TaskRequestType.MATCH_TEMPLATES]: MatchTemplatesRequest;
  [TaskRequestType.FIND_FRAME]: FindFrameRequest;
  [TaskRequestType.PROCESS_ONLINE_VIDEO]: ProcessOnlineVideoRequest;
  [TaskRequestType.PUSH_FINGERPRINTS]: PushFingerprintsRequest;
  [TaskRequestType.PULL_FINGERPRINTS]: PullFingerprintsRequest;
  [TaskRequestType.MATCH_REMOTE_FINGERPRINTS]: MatchRemoteFingerprintsRequest;
  [TaskRequestType.PREPARE_SEMANTIC_SEARCH]: PrepareSemanticSearchRequest;
  [TaskRequestType.GENERATE_TILES]: GenerateTilesRequest;
};

/**
 * Task type to result type mapping.
 */
export type TaskResultMap = {
  [TaskRequestType.DIRECTORY]: ProcessDirectoryResult;
  [TaskRequestType.FILE_LIST]: ProcessFileListResult;
  [TaskRequestType.MATCH_TEMPLATES]: MatchTemplatesResult;
  [TaskRequestType.FIND_FRAME]: FindFrameResult;
  [TaskRequestType.PROCESS_ONLINE_VIDEO]: ProcessOnlineVideoResult;
  [TaskRequestType.PUSH_FINGERPRINTS]: PushFingerprintsResult;
  [TaskRequestType.PULL_FINGERPRINTS]: PullFingerprintsResult;
  [TaskRequestType.MATCH_REMOTE_FINGERPRINTS]: MatchRemoteFingerprintsResult;
  [TaskRequestType.PREPARE_SEMANTIC_SEARCH]: PrepareSemanticSearchResult;
  [TaskRequestType.GENERATE_TILES]: GenerateTilesResult;
};

/**
 * Possible tasks statuses.
 */
export enum TaskStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  CANCELLED = "REVOKED",
}

/**
 * Task error descriptor.
 */
export type TaskError = {
  type: string;
  module: string;
  message: string;
  traceback: string;
};

/**
 * Background task.
 */
export type Task<TRequest extends TaskRequest = TaskRequest> = {
  id: string;
  submissionTime: Date;
  statusUpdateTime: Date;
  status: TaskStatus;
  request: TRequest;
  error?: TaskError;
  progress?: number;
  raw: JsonObject;
  result?: TaskResultMap[TRequest["type"]] | null;
};

/**
 * Make default ProcessDirectoryRequest
 */
export function makeProcDirRequest(
  req: Partial<ProcessDirectoryRequest> = {}
): ProcessDirectoryRequest {
  return {
    type: TaskRequestType.DIRECTORY,
    directory: ".",
    ...req,
  };
}

/**
 * Make default ProcessFileListRequest
 */
export function makeProcFileListRequest(
  req: Partial<ProcessFileListRequest> = {}
): ProcessFileListRequest {
  return {
    type: TaskRequestType.FILE_LIST,
    files: [],
    ...req,
  };
}

/**
 * Make default MatchTemplatesRequest
 */
export function makeMatchTemplatesRequest(
  req: Partial<MatchTemplatesRequest> = {}
): MatchTemplatesRequest {
  return {
    type: TaskRequestType.MATCH_TEMPLATES,
    ...req,
  };
}

/**
 * Make default FindFrameRequest
 */
export function makeFindFrameRequest(
  req: Partial<FindFrameRequest> = {}
): FindFrameRequest {
  return {
    type: TaskRequestType.FIND_FRAME,
    fileId: -1,
    frameTimeMillis: -1,
    ...req,
  };
}

/**
 * Make default ProcessOnlineVideoRequest
 */
export function makeProcessOnlineVideoRequest(
  req: Partial<ProcessOnlineVideoRequest> = {}
): ProcessOnlineVideoRequest {
  return {
    type: TaskRequestType.PROCESS_ONLINE_VIDEO,
    urls: [],
    destinationTemplate: "%(title)s.%(ext)s",
    ...req,
  };
}

/**
 * Make default PushFingerprintsRequest
 */
export function makePushFingerprintsRequest(
  req: Partial<PushFingerprintsRequest> = {}
): PushFingerprintsRequest {
  return {
    type: TaskRequestType.PUSH_FINGERPRINTS,
    repositoryId: 0,
    ...req,
  };
}

/**
 * Make default PullFingerprintsRequest
 */
export function makePullFingerprintsRequest(
  req: Partial<PullFingerprintsRequest> = {}
): PullFingerprintsRequest {
  return {
    type: TaskRequestType.PULL_FINGERPRINTS,
    repositoryId: 0,
    ...req,
  };
}

/**
 * Make default MatchRemoteFingerprintsRequest
 */
export function makeMatchRemoteFingerprintsRequest(
  req: Partial<MatchRemoteFingerprintsRequest> = {}
): MatchRemoteFingerprintsRequest {
  return {
    type: TaskRequestType.MATCH_REMOTE_FINGERPRINTS,
    ...req,
  };
}

/**
 * Make default PrepareSemanticSearch
 */
export function makePrepareSemanticSearchRequest(
  req: Partial<PrepareSemanticSearchRequest> = {}
): PrepareSemanticSearchRequest {
  return {
    type: TaskRequestType.PREPARE_SEMANTIC_SEARCH,
    force: true,
    ...req,
  };
}

/**
 * Make default GenerateTilesRequest
 */
export function makeGenerateTilesRequest(
  req: Partial<GenerateTilesRequest> = {}
): GenerateTilesRequest {
  return {
    type: TaskRequestType.GENERATE_TILES,
    algorithm: "pacmap",
    maxZoom: 8,
    force: false,
    ...req,
  };
}

/**
 * Make default request (correct shape, but possible invalid data).
 */
export function makeTaskRequest(type: TaskRequestType): TaskRequest {
  switch (type) {
    case TaskRequestType.DIRECTORY:
      return makeProcDirRequest();
    case TaskRequestType.FILE_LIST:
      return makeProcFileListRequest();
    case TaskRequestType.MATCH_TEMPLATES:
      return makeMatchTemplatesRequest();
    case TaskRequestType.FIND_FRAME:
      return makeFindFrameRequest();
    case TaskRequestType.PROCESS_ONLINE_VIDEO:
      return makeProcessOnlineVideoRequest();
    case TaskRequestType.PUSH_FINGERPRINTS:
      return makePushFingerprintsRequest();
    case TaskRequestType.PULL_FINGERPRINTS:
      return makePullFingerprintsRequest();
    case TaskRequestType.MATCH_REMOTE_FINGERPRINTS:
      return makeMatchRemoteFingerprintsRequest();
    case TaskRequestType.PREPARE_SEMANTIC_SEARCH:
      return makePrepareSemanticSearchRequest();
    case TaskRequestType.GENERATE_TILES:
      return makeGenerateTilesRequest();
  }
}
