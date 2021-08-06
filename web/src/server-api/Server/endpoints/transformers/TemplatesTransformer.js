/**
 * Templates API args & results transformer.
 */
import FilesTransformer from "./FilesTransformer";

export default class TemplatesTransformer {
  constructor(fileTransform) {
    this.fileTransform = fileTransform || new FilesTransformer();
  }

  /**
   * Convert template filters to templates query parameters
   * @typedef {{}} TemplateFilters
   * @param {TemplateFilters} filters
   * @param {string[]} fields
   * @return {{}} templates query parameters
   */
  listParams(filters, fields) {
    const params = {};
    if (fields != null && fields.length > 0) {
      params.include = fields.join(",");
    }
    return params;
  }

  /**
   * Convert template list results.
   * @param data server response
   * @return {{total, offset, templates}}
   */
  templates(data) {
    return {
      offset: data.offset,
      total: data.total,
      templates: data.items.map((template) => this.template(template)),
    };
  }

  /**
   * Convert template DTO to template object.
   * @param data template DTO
   * @return {Template}
   */
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
      examples: (data.examples || []).map((example) => this.example(example)),
    };
  }

  /**
   * Make new-template DTO.
   * @param {Template} template template object to be created
   * @return {{}}
   */
  newTemplateDTO(template) {
    return {
      name: template.name,
      icon_type: template.icon?.kind,
      icon_key: template.icon?.key,
    };
  }

  /**
   * Convert list-example filters to query parameters.
   *
   * @typedef {{
   *   templateId: number|string,
   * }} ExampleFilters
   * @param {ExampleFilters} filters
   * @param {string[]} fields
   * @return {{}} examples query parameters.
   */
  exampleParams(filters, fields) {
    const params = {};
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
   * @param data server response
   * @return {{total, offset, examples}}
   */
  examples(data) {
    return {
      offset: data.offset,
      total: data.total,
      examples: data.items.map((example) => this.example(example)),
    };
  }

  /**
   * Convert example DTO to example object.
   * @param data example DTO
   * @return {Example}
   */
  example(data) {
    return {
      id: data.id,
      templateId: data.template_id,
      template: this.template(data.template),
      url: `/api/v1/examples/${data.id}/image`,
    };
  }

  /**
   * Template matches filters to query parameters.
   * @typedef {{
   *   templateId: string|number|undefined,
   *   fileId: string|number|undefined,
   * }} TemplateMatchFilters
   * @param {TemplateMatchFilters} filters
   * @param {string[]} fields
   * @return {{}} template matches query parameters
   */
  matchesParams(filters, fields) {
    const params = {};
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

  /**
   * Convert list template matches results
   * @param data server response
   * @return {{total, offset, templateMatches, templates: Template[], files: *[]}}
   */
  matches(data) {
    return {
      offset: data.offset,
      total: data.total,
      templateMatches: data.items.map((match) => this.match(match)),
      files: (data.files || []).map((file) => this.fileTransform.file(file)),
      templates: (data.templates || []).map((template) =>
        this.template(template)
      ),
    };
  }

  /**
   * Convert match DTO to match object.
   * @param data match DTO
   * @return {TemplateMatch}
   */
  match(data) {
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
  updateMatchDTO(match) {
    return {
      false_positive: match.falsePositive,
    };
  }
}