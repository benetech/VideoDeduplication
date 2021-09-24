import FilesTransformer from "./FilesTransformer";
import TemplatesTransformer from "./TemplatesTransformer";
import { QueryParams, QueryResultsDTO } from "../dto/query";
import {
  TemplateExclusion,
  TemplateExclusionFilters,
} from "../../../model/Template";
import { ListRequest, ListResults } from "../../ServerAPI";
import { NewExclusionDTO, TemplateExclusionDTO } from "../dto/templates";
import { Transient } from "../../../lib/entity/Entity";

type TransformerParams = {
  templateTransform?: TemplatesTransformer;
  fileTransform?: FilesTransformer;
};

/**
 * Template exclusions API request & response transformer.
 */
export default class TemplateExclusionsTransformer {
  private readonly templateTransform: TemplatesTransformer;
  private readonly fileTransform: FilesTransformer;

  constructor(options: TransformerParams = {}) {
    const {
      templateTransform = new TemplatesTransformer(),
      fileTransform = new FilesTransformer(),
    } = options;
    this.templateTransform = templateTransform;
    this.fileTransform = fileTransform;
  }

  /**
   * Convert list template exclusions filters to query parameters.
   */
  listParams(filters: TemplateExclusionFilters): QueryParams {
    const params: QueryParams = {};
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
   */
  exclusions(
    data: QueryResultsDTO<TemplateExclusionDTO>,
    request: ListRequest<TemplateExclusionFilters>
  ): ListResults<TemplateExclusion, TemplateExclusionFilters> {
    return {
      request,
      total: data.total,
      items: data.items.map((exclusion) => this.exclusion(exclusion)),
    };
  }

  /**
   * Convert template exclusion DTO to template exclusion object.
   */
  exclusion(data: TemplateExclusionDTO): TemplateExclusion {
    return {
      id: data.id,
      file: this.fileTransform.file(data.file),
      template: this.templateTransform.template(data.template),
    };
  }

  /**
   * Make new-exclusion DTO from exclusion object.
   */
  newExclusionDTO(exclusion: Transient<TemplateExclusion>): NewExclusionDTO {
    return {
      file_id: exclusion.file.id,
      template_id: exclusion.template.id,
    };
  }
}
