import utcDate, { defaultDateFormat } from "../../../lib/helpers/utcDate";
import {
  FindFrameRequest,
  FindFrameResult,
  MatchTemplatesRequest,
  MatchTemplatesResult,
  ProcessDirectoryRequest,
  ProcessDirectoryResult,
  ProcessFileListRequest,
  ProcessFileListResult,
  ProcessOnlineVideoRequest,
  ProcessOnlineVideoResult,
  Task,
  TaskConfig,
  TaskError,
  TaskFilters,
  TaskRequest,
  TaskRequestType,
  TaskResult,
  TaskStatus,
} from "../../../model/Task";
import {
  FindFrameRequestDTO,
  FindFrameResultDTO,
  MatchTemplatesRequestDTO,
  MatchTemplatesResultDTO,
  ProcessDirectoryRequestDTO,
  ProcessDirectoryResultDTO,
  ProcessFileListRequestDTO,
  ProcessFileListResultDTO,
  ProcessOnlineVideoRequestDTO,
  ProcessOnlineVideoResultDTO,
  RawTaskStatus,
  RawTaskType,
  RequestConfigDTO,
  TaskDTO,
  TaskErrorDTO,
  TaskRequestDTO,
} from "../dto/tasks";
import { QueryParams, QueryResultsDTO } from "../dto/query";
import { ListRequest, ListResults } from "../../ServerAPI";

class TaskRequestTransformer {
  request(data: TaskRequestDTO): TaskRequest {
    switch (data.type) {
      case RawTaskType.ProcessDirectory:
        return this.processDirReq(data);
      case RawTaskType.ProcessFileList:
        return this.processFileListReq(data);
      case RawTaskType.MatchTemplates:
        return this.matchTemplatesReq(data);
      case RawTaskType.FindFrame:
        return this.findFrameReq(data);
      case RawTaskType.ProcessOnlineVideo:
        return this.processOnlineVideoReq(data);
    }
  }

  requestDTO(req: TaskRequest): TaskRequestDTO {
    switch (req.type) {
      case TaskRequestType.DIRECTORY:
        return this.processDirDTO(req);
      case TaskRequestType.FILE_LIST:
        return this.processFileListDTO(req);
      case TaskRequestType.MATCH_TEMPLATES:
        return this.matchTemplatesDTO(req);
      case TaskRequestType.FIND_FRAME:
        return this.findFrameDTO(req);
      case TaskRequestType.PROCESS_ONLINE_VIDEO:
        return this.processOnlineVideoDTO(req);
    }
  }

  processDirReq(data: ProcessDirectoryRequestDTO): ProcessDirectoryRequest {
    return {
      type: TaskRequestType.DIRECTORY,
      directory: data.directory,
      ...this.configReq(data),
    };
  }

  processDirDTO(req: ProcessDirectoryRequest): ProcessDirectoryRequestDTO {
    return {
      type: RawTaskType.ProcessDirectory,
      directory: req.directory,
      ...this.configDTO(req),
    };
  }

  processFileListReq(data: ProcessFileListRequestDTO): ProcessFileListRequest {
    return {
      type: TaskRequestType.FILE_LIST,
      files: data.files,
      ...this.configReq(data),
    };
  }

  processFileListDTO(req: ProcessFileListRequest): ProcessFileListRequestDTO {
    return {
      type: RawTaskType.ProcessFileList,
      files: req.files,
      ...this.configDTO(req),
    };
  }

  matchTemplatesReq(data: MatchTemplatesRequestDTO): MatchTemplatesRequest {
    return {
      type: TaskRequestType.MATCH_TEMPLATES,
      templateDistance: data.template_distance,
      templateDistanceMin: data.template_distance_min,
      ...this.configReq(data),
    };
  }

  matchTemplatesDTO(req: MatchTemplatesRequest): MatchTemplatesRequestDTO {
    return {
      type: RawTaskType.MatchTemplates,
      template_distance: req.templateDistance,
      template_distance_min: req.templateDistanceMin,
      ...this.configDTO(req),
    };
  }

  findFrameReq(data: FindFrameRequestDTO): FindFrameRequest {
    return {
      type: TaskRequestType.FIND_FRAME,
      fileId: data.file_id,
      frameTimeMillis: data.frame_time_millis,
      directory: data.directory,
      templateDistance: data.template_distance,
      templateDistanceMin: data.template_distance_min,
      ...this.configReq(data),
    };
  }

  findFrameDTO(req: FindFrameRequest): FindFrameRequestDTO {
    return {
      type: RawTaskType.FindFrame,
      file_id: req.fileId,
      frame_time_millis: req.frameTimeMillis,
      directory: req.directory,
      template_distance: req.templateDistance,
      template_distance_min: req.templateDistanceMin,
      ...this.configDTO(req),
    };
  }

  processOnlineVideoReq(
    data: ProcessOnlineVideoRequestDTO
  ): ProcessOnlineVideoRequest {
    return {
      type: TaskRequestType.PROCESS_ONLINE_VIDEO,
      urls: data.urls,
      destinationTemplate: data.destination_template,
      ...this.configReq(data),
    };
  }

  processOnlineVideoDTO(
    req: ProcessOnlineVideoRequest
  ): ProcessOnlineVideoRequestDTO {
    return {
      type: RawTaskType.ProcessOnlineVideo,
      urls: req.urls,
      destination_template: req.destinationTemplate,
      ...this.configDTO(req),
    };
  }

  configReq(data: RequestConfigDTO): TaskConfig {
    return {
      darkThreshold: data.dark_threshold,
      extensions: data.extensions,
      filterDark: data.filter_dark,
      frameSampling: data.frame_sampling,
      matchDistance: data.match_distance,
      minDuration: data.min_duration,
      saveFrames: data.save_frames,
    };
  }

  configDTO(config: TaskConfig): RequestConfigDTO {
    return {
      match_distance: config.matchDistance,
      frame_sampling: config.frameSampling,
      filter_dark: config.filterDark,
      extensions: config.extensions,
      dark_threshold: config.darkThreshold,
      min_duration: config.minDuration,
      save_frames: config.saveFrames,
    };
  }
}

class TaskResultTransformer {
  result(task: TaskDTO): TaskResult | null {
    switch (task.request.type) {
      case RawTaskType.ProcessDirectory:
        return this.processDirRes(
          task.result as ProcessDirectoryResultDTO | null
        );
      case RawTaskType.ProcessFileList:
        return this.processFileListRes(
          task.result as ProcessFileListResultDTO | null
        );
      case RawTaskType.MatchTemplates:
        return this.matchTemplatesRes(
          task.result as MatchTemplatesResultDTO | null
        );
      case RawTaskType.FindFrame:
        return this.findFrameRes(task.result as FindFrameResultDTO | null);
      case RawTaskType.ProcessOnlineVideo:
        return this.processOnlineVideoRes(
          task.result as ProcessOnlineVideoResultDTO | null
        );
    }
  }

  processDirRes(
    data: ProcessDirectoryResultDTO | null
  ): ProcessDirectoryResult | null {
    return data; // no difference
  }

  processFileListRes(
    data: ProcessFileListResultDTO | null
  ): ProcessFileListResult | null {
    return data; // no difference
  }

  matchTemplatesRes(
    data: MatchTemplatesResultDTO | null
  ): MatchTemplatesResult | null {
    if (data == null) {
      return null;
    }
    return {
      fileCounts: data.file_counts.map((entry) => ({
        fileCount: entry.file_count,
        templateId: entry.template,
      })),
    };
  }

  findFrameRes(data: FindFrameResultDTO | null): FindFrameResult | null {
    if (data == null) {
      return null;
    }
    return {
      matches: data.matches.map((entry) => ({
        fileId: entry.file_id,
        startMs: entry.start_ms,
        endMs: entry.end_ms,
      })),
    };
  }

  processOnlineVideoRes(
    data: ProcessOnlineVideoResultDTO | null
  ): ProcessOnlineVideoResult | null {
    return data; // no difference
  }
}

/**
 * Tasks API endpoint argument & results transformer.
 */
export default class TasksTransformer {
  private readonly utcDateFormat: string;
  private readonly reqTransform: TaskRequestTransformer;
  private readonly resTransform: TaskResultTransformer;

  constructor(
    utcDateFormat = defaultDateFormat,
    reqTransform?: TaskRequestTransformer,
    resTransform?: TaskResultTransformer
  ) {
    this.utcDateFormat = utcDateFormat;
    this.reqTransform = reqTransform || new TaskRequestTransformer();
    this.resTransform = resTransform || new TaskResultTransformer();
  }

  /**
   * Convert list tasks results.
   */
  tasks(
    data: QueryResultsDTO<TaskDTO>,
    request: ListRequest<TaskFilters>
  ): ListResults<Task, TaskFilters> {
    return {
      request,
      items: data.items.map((task) => this.task(task)),
      total: data.total,
    };
  }

  /**
   * Convert task DTO to task object.
   */
  task(data: TaskDTO): Task {
    return {
      id: data.id,
      submissionTime: utcDate(data.created, this.utcDateFormat),
      statusUpdateTime: utcDate(data.status_updated, this.utcDateFormat),
      status: this._status(data.status),
      request: this.reqTransform.request(data.request),
      progress: data.progress,
      error: this._taskError(data.error),
      result: this.resTransform.result(data),
      raw: data,
    };
  }

  /**
   * Convert task list filters to query parameters.
   */
  listParams(filters?: TaskFilters): QueryParams {
    const params: QueryParams = {};
    if (filters == null) {
      return params;
    }
    if (filters.status != null && (filters?.status?.length || 0) > 0) {
      params.status = filters.status.join(",");
    }
    if (filters.type != null && (filters?.type?.length || 0) > 0) {
      params.type = filters.type.join(",");
    }
    return params;
  }

  /**
   * Convert task request to request DTO.
   */
  requestDTO(request: TaskRequest): TaskRequestDTO {
    return this.reqTransform.requestDTO(request);
  }

  _taskError(data?: TaskErrorDTO): TaskError | undefined {
    if (data == null) {
      return undefined;
    }
    return {
      type: data.exc_type,
      message: data.exc_message,
      module: data.exc_module,
      traceback: data.traceback,
    };
  }

  _status(status: RawTaskStatus): TaskStatus {
    switch (status) {
      case RawTaskStatus.PENDING:
        return TaskStatus.PENDING;
      case RawTaskStatus.RUNNING:
        return TaskStatus.RUNNING;
      case RawTaskStatus.SUCCESS:
        return TaskStatus.SUCCESS;
      case RawTaskStatus.FAILURE:
        return TaskStatus.FAILURE;
      case RawTaskStatus.REVOKED:
        return TaskStatus.CANCELLED;
    }
  }

  _statusDTO(status: TaskStatus): RawTaskStatus {
    switch (status) {
      case TaskStatus.PENDING:
        return RawTaskStatus.PENDING;
      case TaskStatus.RUNNING:
        return RawTaskStatus.RUNNING;
      case TaskStatus.SUCCESS:
        return RawTaskStatus.SUCCESS;
      case TaskStatus.FAILURE:
        return RawTaskStatus.FAILURE;
      case TaskStatus.CANCELLED:
        return RawTaskStatus.REVOKED;
    }
  }
}
