import lodash from "lodash";
import TaskRequest from "../../collection/state/tasks/TaskRequest";
import utcDate, { defaultDateFormat } from "./helpers/utcDate";

/**
 * Common Request DTO props => Request Model props.
 */
const CommonRequestProps = {
  frame_sampling: "frameSampling",
  match_distance: "matchDistance",
  filter_dark: "filterDark",
  dark_threshold: "darkThreshold",
  min_duration: "minDuration",
  extensions: "extensions",
};

/**
 * Map prop pairs.
 * @param source object with source data.
 * @param destination object to be written
 * @param mappings [sourceProp, destProp] property name pairs.
 * @returns {*} destination object
 */
function mapProps(source, destination, mappings) {
  for (const [sourceProp, destProp] of mappings) {
    if (Object.prototype.hasOwnProperty.call(source, sourceProp)) {
      destination[destProp] = source[sourceProp];
    }
  }
  return destination;
}

/**
 * Create default transformations for known task types.
 * @returns {Map<any, any>}
 */
function makeTaskTypeTransforms() {
  const transforms = new Map();

  // Mappings for ProcessDirectory task
  transforms.set(TaskRequest.DIRECTORY, {
    requestProps: {
      ...CommonRequestProps,
      directory: "directory",
    },
    fromResultsDTO: lodash.identity,
  });

  // Mappings for ProcessFiles task
  transforms.set(TaskRequest.FILE_LIST, {
    requestProps: {
      ...CommonRequestProps,
      files: "files",
    },
    fromResultsDTO: lodash.identity,
  });

  // Mappings for MatchTemplates task
  transforms.set(TaskRequest.MATCH_TEMPLATES, {
    requestProps: {
      ...CommonRequestProps,
      template_distance: "templateDistance",
      template_distance_min: "templateDistanceMin",
    },
    fileCountProps: {
      template: "templateId",
      file_count: "fileCount",
    },
    fromResultsDTO(resultsDTO) {
      return {
        fileCounts: resultsDTO.file_counts.map((count) =>
          mapProps(count, {}, Object.entries(this.fileCountProps))
        ),
      };
    },
  });

  // Mappings for FindFrame task
  transforms.set(TaskRequest.FIND_FRAME, {
    requestProps: {
      ...CommonRequestProps,
      template_distance: "templateDistance",
      template_distance_min: "templateDistanceMin",
      file_id: "fileId",
      frame_time_sec: "frameTimeSec",
      directory: "directory",
    },
    matchProps: {
      file_id: "fileId",
      start_ms: "startMs",
      end_ms: "endMs",
    },
    fromResultsDTO(resultsDTO) {
      return {
        matches: resultsDTO.matches.map((match) =>
          mapProps(match, {}, Object.entries(this.matchProps))
        ),
      };
    },
  });

  return transforms;
}

export const DefaultTaskTypeTransforms = makeTaskTypeTransforms();

export default class TaskTransform {
  constructor(
    utcDateFormat = defaultDateFormat,
    typeTransforms = DefaultTaskTypeTransforms
  ) {
    this.utcDateFormat = utcDateFormat;
    this.typeTransforms = typeTransforms;
  }

  task(taskDTO) {
    const request = this.fromRequestDTO(taskDTO.request);
    return {
      id: taskDTO.id,
      submissionTime: utcDate(taskDTO.created, this.utcDateFormat),
      statusUpdateTime: utcDate(taskDTO.status_updated, this.utcDateFormat),
      status: taskDTO.status,
      request: request,
      progress: taskDTO.progress,
      error: this._taskError(taskDTO.error),
      result: this._fromResultsDTO(taskDTO.result, request.type),
      raw: taskDTO,
    };
  }

  _taskError(data) {
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

  /**
   * Convert request DTO to request model object.
   * @param requestDTO
   * @returns {*} request model object
   */
  fromRequestDTO(requestDTO) {
    const mapping = this.typeTransforms.get(requestDTO.type).requestProps;
    if (mapping) {
      const request = { type: requestDTO.type };
      return mapProps(requestDTO, request, Object.entries(mapping));
    } else {
      const type = requestDTO.type;
      console.warn("Don't know how to convert task request DTO", type);
      return requestDTO;
    }
  }

  /**
   * Convert request model object to request DTO.
   * @param request
   * @returns {*} request DTO.
   */
  toRequestDTO(request) {
    const mapping = this.typeTransforms.get(request.type).requestProps;
    if (mapping) {
      const requestDTO = { type: request.type };
      return mapProps(
        request,
        requestDTO,
        Object.entries(mapping).map(lodash.reverse)
      );
    } else {
      console.warn("Don't know how to convert task request", request.type);
      return request;
    }
  }

  /**
   * Covert task results DTO into results model object.
   * @param resultsDTO DTO to be converted.
   * @param taskType the corresponding task type.
   * @returns {*} results model object.
   */
  _fromResultsDTO(resultsDTO, taskType) {
    if (resultsDTO == null) {
      return null;
    }
    const transform = this.typeTransforms.get(taskType);
    if (transform) {
      try {
        return transform.fromResultsDTO(resultsDTO);
      } catch (error) {
        console.error("Error transforming result", error, {
          error,
          resultsDTO,
          taskType,
        });
        return null;
      }
    }
    console.warn("Don't know how to convert task results", taskType);
    return null;
  }
}