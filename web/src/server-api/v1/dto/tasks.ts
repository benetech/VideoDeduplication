import { RawEmbeddingAlgorithm } from "./embeddings";

export type TaskErrorDTO = {
  exc_type: string;
  exc_message: string;
  exc_module: string;
  traceback: string;
};

export enum RawTaskStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  REVOKED = "REVOKED",
}

export enum RawTaskType {
  ProcessDirectory = "ProcessDirectory",
  ProcessFileList = "ProcessFileList",
  MatchTemplates = "MatchTemplates",
  FindFrame = "FindFrame",
  ProcessOnlineVideo = "ProcessOnlineVideo",
  PushFingerprints = "PushFingerprints",
  PullFingerprints = "PullFingerprints",
  MatchRemoteFingerprints = "MatchRemoteFingerprints",
  PrepareSemanticSearch = "PrepareSemanticSearch",
  GenerateTiles = "GenerateTiles",
}

export type TypedRequestDTO = {
  type: RawTaskType;
};

export type RequestConfigDTO = {
  frame_sampling?: number;
  save_frames?: boolean;
  filter_dark?: boolean;
  dark_threshold?: number;
  extensions?: string[];
  match_distance?: number;
  min_duration?: number;
};

export type BaseRequestDTO = TypedRequestDTO & RequestConfigDTO;

export type ProcessDirectoryRequestDTO = BaseRequestDTO & {
  type: RawTaskType.ProcessDirectory;
  directory: string;
};

export function isProcessDirectoryRequestDTO(
  data: TypedRequestDTO
): data is ProcessDirectoryRequestDTO {
  return data.type === RawTaskType.ProcessDirectory;
}

export type ProcessFileListRequestDTO = BaseRequestDTO & {
  type: RawTaskType.ProcessFileList;
  files: string[];
};

export function isProcessFileListRequestDTO(
  data: TypedRequestDTO
): data is ProcessFileListRequestDTO {
  return data.type === RawTaskType.ProcessFileList;
}

export type MatchTemplatesRequestDTO = BaseRequestDTO & {
  type: RawTaskType.MatchTemplates;
  template_distance?: number;
  template_distance_min?: number;
};

export function isMatchTemplatesRequestDTO(
  data: TypedRequestDTO
): data is MatchTemplatesRequestDTO {
  return data.type === RawTaskType.MatchTemplates;
}

export type FindFrameRequestDTO = BaseRequestDTO & {
  type: RawTaskType.FindFrame;
  file_id: number;
  frame_time_millis: number;
  directory?: string;
  template_distance?: number;
  template_distance_min?: number;
};

export function isFindFrameRequestDTO(
  data: TypedRequestDTO
): data is FindFrameRequestDTO {
  return data.type === RawTaskType.FindFrame;
}

export type ProcessOnlineVideoRequestDTO = BaseRequestDTO & {
  type: RawTaskType.ProcessOnlineVideo;
  urls: string[];
  destination_template?: string;
};

export function isProcessOnlineVideoRequestDTO(
  data: TypedRequestDTO
): data is ProcessOnlineVideoRequestDTO {
  return data.type === RawTaskType.ProcessOnlineVideo;
}

export type PushFingerprintsRequestDTO = {
  type: RawTaskType.PushFingerprints;
  repository_id: number;
};

export function isPushFingerprintsRequestDTO(
  data: TypedRequestDTO
): data is PushFingerprintsRequestDTO {
  return data.type === RawTaskType.PushFingerprints;
}

export type PullFingerprintsRequestDTO = {
  type: RawTaskType.PullFingerprints;
  repository_id: number;
};

export function isPullFingerprintsRequestDTO(
  data: TypedRequestDTO
): data is PullFingerprintsRequestDTO {
  return data.type === RawTaskType.PullFingerprints;
}

export type MatchRemoteFingerprintsRequestDTO = {
  type: RawTaskType.MatchRemoteFingerprints;
  repository_id?: number | null;
  contributor_name?: string | null;
};

export function isMatchRemoteFingerprintsRequestDTO(
  data: TypedRequestDTO
): data is MatchRemoteFingerprintsRequestDTO {
  return data.type === RawTaskType.MatchRemoteFingerprints;
}

export type PrepareSemanticSearchRequestDTO = {
  type: RawTaskType.PrepareSemanticSearch;
  force: boolean;
};

export function isPrepareSemanticSearchRequestDTO(
  data: TypedRequestDTO
): data is PrepareSemanticSearchRequestDTO {
  return data.type === RawTaskType.PrepareSemanticSearch;
}

export type GenerateTilesRequestDTO = {
  type: RawTaskType.GenerateTiles;
  algorithm: RawEmbeddingAlgorithm;
  max_zoom: number;
  force: boolean;
};

export function isGenerateTilesRequestDTO(
  data: TypedRequestDTO
): data is GenerateTilesRequestDTO {
  return data.type === RawTaskType.GenerateTiles;
}

export type TaskRequestDTO =
  | ProcessDirectoryRequestDTO
  | ProcessFileListRequestDTO
  | MatchTemplatesRequestDTO
  | FindFrameRequestDTO
  | ProcessOnlineVideoRequestDTO
  | PushFingerprintsRequestDTO
  | PullFingerprintsRequestDTO
  | MatchRemoteFingerprintsRequestDTO
  | PrepareSemanticSearchRequestDTO
  | GenerateTilesRequestDTO;

export type FileCountDTO = {
  template: number;
  file_count: number;
};

export type FoundFrameDTO = {
  file_id: number;
  start_ms: number;
  end_ms: number;
};

export type ProcessedFileDTO = {
  id: number;
  path: string;
};

export type ProcessDirectoryResultDTO = undefined;
export type ProcessFileListResultDTO = undefined;
export type MatchTemplatesResultDTO = { file_counts: FileCountDTO[] };
export type FindFrameResultDTO = { matches: FoundFrameDTO[] };
export type ProcessOnlineVideoResultDTO = { files: ProcessedFileDTO[] };
export type PushFingerprintsResultDTO = undefined;
export type PullFingerprintsResultDTO = undefined;
export type MatchRemoteFingerprintsResultDTO = undefined;
export type PrepareSemanticSearchResultDTO = undefined;
export type GenerateTilesResultDTO = undefined;

export type TaskResultDTO =
  | ProcessDirectoryResultDTO
  | ProcessFileListResultDTO
  | MatchTemplatesResultDTO
  | FindFrameResultDTO
  | ProcessOnlineVideoResultDTO
  | PushFingerprintsResultDTO
  | PullFingerprintsResultDTO
  | MatchRemoteFingerprintsResultDTO
  | PrepareSemanticSearchResultDTO
  | GenerateTilesResultDTO;

export type TaskDTO = {
  id: string;
  created: string;
  status_updated: string;
  status: RawTaskStatus;
  request: TaskRequestDTO;
  error?: TaskErrorDTO;
  progress?: number;
  result?: TaskResultDTO | null;
};

export type LogsUpdateMessageDTO = {
  task_id: TaskDTO["id"];
  data: string;
};
