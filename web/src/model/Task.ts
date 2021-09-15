import { JsonObject } from "../lib/Json";

/**
 * Task query filters.
 */
export type TaskFilters = {
  status: TaskStatus[];
  type: TaskRequestType[];
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
}

/**
 * Background task request.
 */
export type TaskRequest = {
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
export type Task = {
  id: number;
  submissionTime: Date;
  statusUpdateTime: Date;
  status: TaskStatus;
  request: TaskRequest;
  error?: TaskError;
  raw: JsonObject;
};
