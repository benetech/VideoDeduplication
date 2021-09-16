import FilesTransformer from "./FilesTransformer";
import getEntityId from "../../../../lib/entity/getEntityId";

/**
 * Templates API args & results transformer.
 */
export default class TemplatesTransformer {
  constructor(fileTransform) {
    this.fileTransform = fileTransform || new FilesTransformer();
  }

  /**
   * @typedef {{
   *   name: string
   * }} TemplateFilters
   */

  /**
   * Convert template filters to templates query parameters
   *
   * @param {TemplateFilters} filters
   * @param {string[]} fields
   * @return {{}} templates query parameters
   */
  listParams(filters, fields) {
    const params = {};
    if (filters?.name != null && filters.name.length > 0) {
      params.name = filters.name;
    }
    if (fields != null && fields.length > 0) {
      params.include = fields.join(",");
    }
    return params;
  }

  /**
   * @typedef {{
   *   request: ListTemplatesOptions,
   *   items:TemplateEntity[] ,
   *   total: number,
   * }} ListTemplatesResults
   */

  /**
   * Convert template list results.
   * @param data server response
   * @param {ListTemplatesOptions} request
   * @return {ListTemplatesResults}
   */
  templates(data, request) {
    return {
      request,
      total: data.total,
      items: data.items.map((template) => this.template(template)),
    };
  }

  /**
   * Convert template DTO to template object.
   * @param data template DTO
   * @return {TemplateEntity}
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
   * @param {TemplateEntity} template template object to be created
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
   * @typedef {{
   *   templateId: number|string,
   * }} ExampleFilters
   */

  /**
   * Convert list-example filters to query parameters.
   *
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
   * @typedef {{
   *   request: ListExamplesOptions,
   *   items: TemplateExampleEntity[],
   *   total: number,
   * }} ListExamplesResults
   */

  /**
   * Convert list examples results.
   * @param data server response
   * @param {ListExamplesOptions} request
   * @return {ListExamplesResults}
   */
  examples(data, request) {
    return {
      request,
      total: data.total,
      items: data.items.map((example) => this.example(example)),
    };
  }

  /**
   * Convert example DTO to example object.
   * @param data example DTO
   * @return {TemplateExampleEntity}
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
   * Get create-example-from-frame DTO.
   * @param {FileEntity|string|number} file
   * @param {number} time position in file, in milliseconds
   * @return {{file_id: (*), time}}
   */
  frameDTO({ file, time }) {
    return {
      file_id: getEntityId(file),
      time,
    };
  }

  /**
   * @typedef {{
   *   templateId: string|number|undefined,
   *   fileId: string|number|undefined,
   * }} TemplateMatchFilters
   */

  /**
   * Template matches filters to query parameters.
   *
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
   * @typedef {{
   *   request: ListTemplateMatchesOptions,
   *   items: templateMatches: ObjectEntity[],
   *   templates: TemplateEntity[],
   *   files: FileEntity[],
   *   total: number,
   * }} ListTemplateMatchesResults
   */

  /**
   * Convert list template matches results
   * @param data server response
   * @param {ListTemplateMatchesOptions} request
   * @return {ListTemplateMatchesResults}
   */
  matches(data, request) {
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
   * @param {{}} data match DTO
   * @return {ObjectEntity}
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
