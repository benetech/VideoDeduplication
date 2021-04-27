import parse from "date-fns/parse";
import TaskRequest from "../../collection/state/tasks/TaskRequest";

const defaultDateFormat = "yyyy-MM-dd HH:mm:ss.SSSSSS";

/**
 * Mapping from DTO fields to task-request model
 * fields as they are used in the application.
 */
const TaskRequests = {
  [TaskRequest.DIRECTORY]: {
    directory: "directory",
    frame_sampling: "frameSampling",
    match_distance: "matchDistance",
    filter_dark: "filterDark",
    dark_threshold: "darkThreshold",
    min_duration: "minDuration",
    extensions: "extensions",
  },
  [TaskRequest.MATCH_TEMPLATES]: {
    frame_sampling: "frameSampling",
    match_distance: "matchDistance",
    filter_dark: "filterDark",
    dark_threshold: "darkThreshold",
    min_duration: "minDuration",
    extensions: "extensions",
  },
};

/**
 * Data-transfer object and internal data format may evolve independently, the
 * Transform class decouples these two representations.
 */
export default class Transform {
  constructor(utcDateFormat = defaultDateFormat) {
    this.utcDateFormat = utcDateFormat;
  }

  fetchFileResults(data) {
    const counts = {
      all: data.total,
      duplicates: data.duplicates,
      related: data.related,
      unique: data.unique,
    };

    const files = data.items.map((post) => this.videoFile(post));
    return { files, counts };
  }

  videoFile(data) {
    const meta = this.fileMetadata(data);
    return {
      id: data.id,
      filename: data.file_path,
      metadata: {
        fileType: this.fileType(data),
        hasAudio: data.exif && !!data.exif.Audio_Format,
        // Always false, until exif is actually extracted
        // TODO: https://github.com/benetech/VideoDeduplication/issues/313
        hasEXIF: false,
        created: this.fileCreatedDate(data),
        ...meta,
      },
      hash: data.sha256,
      fingerprint: data.signature,
      exif: data.exif,
      preview: `/api/v1/files/${data.id}/thumbnail?time=0`,
      playbackURL: `/api/v1/files/${data.id}/watch`,
      scenes: this.fileScenes(data),
      matchesCount: data.matches_count,
      external: data.contributor != null,
      contributor: this.contributor(data.contributor),
    };
  }

  fileCreatedDate(data) {
    const value = data?.exif?.General_Encoded_Date;
    if (value == null) {
      return null;
    }
    return new Date(value * 1000);
  }

  fileMetadata(data) {
    if (!data.meta) {
      return {
        length: data.exif?.General_Duration || 0,
      };
    }
    return {
      grayMax: data.meta.gray_max,
      flagged: data.meta.flagged,
      length: data.exif?.General_Duration || 0,
    };
  }

  fileType(file) {
    if (file.exif && file.exif.General_FileExtension) {
      return file.exif.General_FileExtension;
    }
    const match = file.file_path?.match(/\.([^/.]+)$/);
    if (match && match[1]) {
      return match[1];
    } else {
      return undefined;
    }
  }

  scene(scene, file) {
    return {
      preview: `/api/v1/files/${file.id}/thumbnail?time=${scene.start_time}`,
      position: scene.start_time * 1000,
      duration: scene.duration * 1000,
    };
  }

  fileScenes(file) {
    const scenes =
      file.scenes && file.scenes.map((scene) => this.scene(scene, file));
    if (!scenes || scenes.length === 0) {
      return [
        {
          preview: `/api/v1/files/${file.id}/thumbnail?time=0`,
          position: 0,
          duration: (file.meta && file.meta.video_length * 1000) || 0,
        },
      ];
    }
    return scenes;
  }

  fetchFileClusterResults(data) {
    return {
      total: data.total,
      matches: data.matches.map((match) => this.fileClusterMatch(match)),
      files: data.files.map((file) => this.videoFile(file)),
    };
  }

  fileClusterMatch(match) {
    return { ...match }; // No difference at the moment
  }

  fetchFileMatchesResults(data) {
    return {
      offset: data.offset,
      total: data.total,
      matches: data.items.map((match) => this.fileMatch(match)),
    };
  }

  fileMatch(match) {
    return {
      id: match.id,
      distance: match.distance,
      motherFileId: match.mother_file_id,
      file: this.videoFile(match.file),
      falsePositive: match.false_positive,
    };
  }

  match(match) {
    return {
      id: match.id,
      distance: match.distance,
      source: this.source,
      target: this.target,
      falsePositive: match.false_positive,
    };
  }

  updateMatchDTO(match) {
    return {
      false_positive: match.falsePositive,
    };
  }

  fetchTasksResults(data) {
    return {
      offset: data.offset,
      total: data.total,
      tasks: data.items.map((task) => this.task(task)),
    };
  }

  task(data) {
    return {
      id: data.id,
      submissionTime: this.utcDate(data.created),
      statusUpdateTime: this.utcDate(data.status_updated),
      status: data.status,
      request: this.fromTaskRequestDTO(data.request),
      progress: data.progress,
      error: this.taskError(data.error),
      result: data.result,
    };
  }

  fromTaskRequestDTO(data) {
    const request = { type: data.type };
    const mapping = TaskRequests[request.type];
    if (mapping) {
      for (const [dtoProp, reqProp] of Object.entries(mapping)) {
        if (Object.prototype.hasOwnProperty.call(data, dtoProp)) {
          request[reqProp] = data[dtoProp];
        }
      }
      return request;
    } else {
      console.warn("Don't know how to convert task request type", data.type);
      return data;
    }
  }

  toTaskRequestDTO(request) {
    console.log("Converting to DTO", request);
    const dto = { type: request.type };
    const mapping = TaskRequests[request.type];
    if (mapping) {
      for (const [dtoProp, reqProp] of Object.entries(mapping)) {
        if (Object.prototype.hasOwnProperty.call(request, reqProp)) {
          dto[dtoProp] = request[reqProp];
        }
      }
      return dto;
    } else {
      console.warn("Don't know how to convert task request type", request.type);
      return request;
    }
  }

  taskError(data) {
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

  utcDate(date) {
    const utcDate = parse(date, this.utcDateFormat, new Date());
    const timestamp = Date.UTC(
      utcDate.getFullYear(),
      utcDate.getMonth(),
      utcDate.getDate(),
      utcDate.getHours(),
      utcDate.getMinutes(),
      utcDate.getSeconds(),
      utcDate.getMilliseconds()
    );
    return new Date(timestamp);
  }

  contributor(data) {
    if (data == null) {
      return undefined;
    }
    return {
      id: data.id,
      name: data.name,
      repository: this.repository(data.repository),
    };
  }

  repository(data) {
    if (data == null) {
      return undefined;
    }
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      login: data.login,
      type: data.type,
    };
  }

  fetchTemplatesResults(data) {
    return {
      offset: data.offset,
      total: data.total,
      templates: data.items.map((template) => this.template(template)),
    };
  }

  fetchExamplesResults(data) {
    return {
      offset: data.offset,
      total: data.total,
      examples: data.items.map((example) => this.templateExample(example)),
    };
  }

  fetchTemplateMatchesResults(data) {
    return {
      offset: data.offset,
      total: data.total,
      templateMatches: data.items.map((match) => this.templateMatch(match)),
      files: (data.files || []).map((file) => this.videoFile(file)),
      templates: (data.templates || []).map((template) =>
        this.template(template)
      ),
    };
  }

  template(data) {
    if (data == null) {
      return undefined;
    }

    return {
      id: data.id,
      name: data.name,
      icon: {
        kind: data.icon_type,
        key: data.icon_key,
      },
      fileCount: data.file_count,
      examples: (data.examples || []).map((example) =>
        this.templateExample(example)
      ),
    };
  }

  templateExample(data) {
    return {
      id: data.id,
      templateId: data.template_id,
      template: this.template(data.template),
      url: `/api/v1/examples/${data.id}/image`,
    };
  }

  templateMatch(data) {
    const match = {
      id: data.id,
      fileId: data.file_id,
      templateId: data.template_id,
      start: data.start_ms,
      end: data.end_ms,
      meanDistance: data.mean_distance_sequence,
      minDistance: data.min_distance_video,
      minDistanceTime: data.min_distance_ms,
      position: data.start_ms,
    };
    if (data.template != null) {
      match.template = this.template(data.template);
    }
    if (data.file != null) {
      match.file = this.videoFile(data.file);
    }
    return match;
  }

  newTemplateDTO(template) {
    return {
      name: template.name,
      icon_type: template.icon?.kind,
      icon_key: template.icon?.key,
    };
  }

  fetchPresetResults(data) {
    return {
      offset: data.offset,
      total: data.total,
      presets: data.items.map((preset) => this.preset(preset)),
    };
  }

  preset(data) {
    return {
      id: data.id,
      name: data.name,
      filters: data.filters,
    };
  }

  newPresetDTO(preset) {
    return {
      name: preset.name,
      filters: preset.filters,
    };
  }

  updatePresetDTO(preset) {
    return {
      name: preset.name,
      filters: preset.filters,
    };
  }
}
