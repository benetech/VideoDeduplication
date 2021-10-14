import FilesTransformer from "./FilesTransformer";
import { QueryParams, QueryResultsDTO } from "../dto/query";
import {
  IconKind,
  Template,
  TemplateExample,
  TemplateExampleFilters,
  TemplateFilters,
  TemplateMatch,
  TemplateMatchFilters,
} from "../../../model/Template";
import {
  ListRequest,
  ListResults,
  ListTemplateMatchesResults,
} from "../../ServerAPI";
import {
  FrameDTO,
  NewTemplateDTO,
  RawIconType,
  TemplateDTO,
  TemplateExampleDTO,
  TemplateMatchDTO,
  TemplateMatchQueryResultsDTO,
  UpdateTemplateMatchDTO,
} from "../dto/templates";
import { Transient, Updates } from "../../../lib/entity/Entity";
import getEntityId from "../../../lib/entity/getEntityId";
import { VideoFile } from "../../../model/VideoFile";

/**
 * Templates API args & results transformer.
 */
export default class TemplatesTransformer {
  private readonly fileTransform: FilesTransformer;

  constructor(fileTransform?: FilesTransformer) {
    this.fileTransform = fileTransform || new FilesTransformer();
  }

  /**
   * Convert template filters to templates query parameters
   */
  listParams(filters: TemplateFilters | null, fields?: string[]): QueryParams {
    const params: QueryParams = {};
    if (filters?.name != null && filters.name.length > 0) {
      params.name = filters.name;
    }
    if (fields != null && fields.length > 0) {
      params.include = fields.join(",");
    }
    return params;
  }

  /**
   * Convert template list results.
   */
  templates(
    data: QueryResultsDTO<TemplateDTO>,
    request: ListRequest<TemplateFilters>
  ): ListResults<Template, TemplateFilters> {
    return {
      request,
      total: data.total,
      items: data.items.map((template) => this.template(template)),
    };
  }

  /**
   * Convert template DTO to template object.
   */
  template(data: TemplateDTO): Template {
    return {
      id: data.id,
      name: data.name,
      icon: {
        kind: this._iconKind(data.icon_type),
        key: data.icon_key,
      },
      fileCount: data.file_count,
      examples: (data.examples || []).map((example) => this.example(example)),
    };
  }

  /**
   * Make new-template DTO.
   */
  newTemplateDTO(template: Transient<Template>): NewTemplateDTO {
    return {
      name: template.name,
      icon_type: this._rawIconType(template.icon?.kind),
      icon_key: template.icon?.key,
    };
  }

  /**
   * Convert list-example filters to query parameters.
   */
  exampleParams(
    filters: TemplateExampleFilters | null,
    fields: string[]
  ): QueryParams {
    const params: QueryParams = {};
    if (fields != null && fields.length > 0) {
      params.include = fields.join(",");
    }
    if (filters?.templateId != null) {
      params.template_id = filters.templateId;
    }
    return params;
  }

  /**
   * Convert list examples results.
   */
  examples(
    data: QueryResultsDTO<TemplateExampleDTO>,
    request: ListRequest<TemplateExampleFilters>
  ): ListResults<TemplateExample, TemplateExampleFilters> {
    return {
      request,
      total: data.total,
      items: data.items.map((example) => this.example(example)),
    };
  }

  /**
   * Convert example DTO to example object.
   */
  example(data: TemplateExampleDTO): TemplateExample {
    return {
      id: data.id,
      templateId: data.template_id,
      template:
        data.template != null ? this.template(data.template) : undefined,
      url: `/api/v1/examples/${data.id}/image`,
    };
  }

  /**
   * Get create-example-from-frame DTO.
   */
  frameDTO(file: VideoFile, time: number): FrameDTO {
    return {
      file_id: getEntityId(file),
      time,
    };
  }

  /**
   * Template matches filters to query parameters.
   */
  matchesParams(
    filters: TemplateMatchFilters | null,
    fields: string[]
  ): QueryParams {
    const params: QueryParams = {};
    if (fields != null && fields.length > 0) {
      params.include = fields.join(",");
    }
    if (filters?.templateId != null) {
      params.template_id = filters.templateId;
    }
    if (filters?.fileId != null) {
      params.file_id = filters.fileId;
    }
    return params;
  }

  matches(
    data: TemplateMatchQueryResultsDTO,
    request: ListRequest<TemplateMatchFilters>
  ): ListTemplateMatchesResults {
    return {
      request,
      total: data.total,
      items: data.items.map((match) => this.match(match)),
      files: (data.files || []).map((file) => this.fileTransform.file(file)),
      templates: (data.templates || []).map((template) =>
        this.template(template)
      ),
    };
  }

  /**
   * Convert match DTO to match object.
   */
  match(data: TemplateMatchDTO): TemplateMatch {
    const match: TemplateMatch = {
      id: data.id,
      fileId: data.file_id,
      templateId: data.template_id,
      start: data.start_ms,
      end: data.end_ms,
      meanDistance: data.mean_distance_sequence,
      minDistance: data.min_distance_video,
      minDistanceTime: data.min_distance_ms,
      falsePositive: data.false_positive,
    };
    if (data.template != null) {
      match.template = this.template(data.template);
    }
    if (data.file != null) {
      match.file = this.fileTransform.file(data.file);
    }
    return match;
  }

  /**
   * Create update-match DTO from match object with updated attributes.
   * @param match match object
   * @return {{false_positive}} update-match DTO
   */
  updateMatchDTO(match: Updates<TemplateMatch>): UpdateTemplateMatchDTO {
    return {
      false_positive: match.falsePositive,
    };
  }

  _iconKind(type: RawIconType): IconKind {
    switch (type) {
      case RawIconType.CUSTOM:
        return IconKind.CUSTOM;
      case RawIconType.PREDEFINED:
        return IconKind.PREDEFINED;
    }
  }

  _rawIconType(kind: IconKind): RawIconType {
    switch (kind) {
      case IconKind.PREDEFINED:
        return RawIconType.PREDEFINED;
      case IconKind.CUSTOM:
        return RawIconType.CUSTOM;
    }
  }
}
