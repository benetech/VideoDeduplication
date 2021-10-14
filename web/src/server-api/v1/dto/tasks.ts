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

export type TaskRequestDTO =
  | ProcessDirectoryRequestDTO
  | ProcessFileListRequestDTO
  | MatchTemplatesRequestDTO
  | FindFrameRequestDTO
  | ProcessOnlineVideoRequestDTO;

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

export type TaskResultDTO =
  | ProcessDirectoryResultDTO
  | ProcessFileListResultDTO
  | MatchTemplatesResultDTO
  | FindFrameResultDTO
  | ProcessOnlineVideoResultDTO;

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
