import FilesTransformer from "./FilesTransformer";
import TemplatesTransformer from "./TemplatesTransformer";

/**
 * Template exclusions API request & response transformer.
 */
export default class TemplateExclusionsTransformer {
  constructor(options = {}) {
    const {
      templateTransform = new TemplatesTransformer(),
      fileTransform = new FilesTransformer(),
    } = options;
    this.templateTransform = templateTransform;
    this.fileTransform = fileTransform;
  }

  /**
   * @typedef {{
   *   templateId: number|string|undefined,
   *   fileId: number|string|undefined,
   * }} TemplateExclusionFilters
   */

  /**
   * Convert list template exclusions filters to query parameters.
   *
   * @param {TemplateExclusionFilters} filters
   * @return {{}} query parameters as object
   */
  listParams(filters) {
    const params = {};
    if (filters?.templateId != null) {
      params.template_id = filters.templateId;
    }
    if (filters?.fileId != null) {
      params.file_id = filters.fileId;
    }
    return params;
  }

  /**
   * Convert list template results.
   * @param data server response.
   * @return {{total, offset, exclusions: TemplateExclusionEntity[]}}
   */
  exclusions(data) {
    return {
      offset: data.offset,
      total: data.total,
      exclusions: data.items.map((exclusion) => this.exclusion(exclusion)),
    };
  }

  /**
   * Convert template exclusion DTO to template exclusion object.
   * @param data template exclusion DTO
   * @return {TemplateExclusionEntity}
   */
  exclusion(data) {
    return {
      id: data.id,
      file: this.fileTransform.file(data.file),
      template: this.templateTransform.template(data.template),
    };
  }

  /**
   * Make new-exclusion DTO from exclusion object.
   * @param {TemplateExclusionEntity} exclusion
   * @return {{}} new-exclusion DTO
   */
  newExclusionDTO(exclusion) {
    return {
      file_id: exclusion.file.id,
      template_id: exclusion.template.id,
    };
  }
}
