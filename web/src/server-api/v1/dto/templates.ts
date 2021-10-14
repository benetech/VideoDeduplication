import { FileDTO } from "./files";
import { QueryResultsDTO } from "./query";

export enum RawIconType {
  CUSTOM = "custom",
  PREDEFINED = "predefined",
}

export type TemplateExampleDTO = {
  id: number;
  template_id: number;
  template?: TemplateDTO;
};

export type TemplateDTO = {
  id: number;
  name: string;
  icon_key: string;
  icon_type: RawIconType;
  examples?: TemplateExampleDTO[];
  file_count?: number;
};

export type TemplateExclusionDTO = {
  id: number;
  file: FileDTO;
  template: TemplateDTO;
};

export type TemplateMatchDTO = {
  id: number;
  file_id: number;
  template_id: number;
  start_ms: number;
  end_ms: number;
  mean_distance_sequence: number;
  min_distance_video: number;
  min_distance_ms: number;
  false_positive: boolean;
  file?: FileDTO;
  template?: TemplateDTO;
};

export type TemplateMatchQueryResultsDTO = QueryResultsDTO<TemplateMatchDTO> & {
  templates?: TemplateDTO[];
  files?: FileDTO[];
};

export type UpdateTemplateMatchDTO = {
  false_positive?: boolean;
};

export type NewTemplateDTO = {
  name: string;
  icon_type: RawIconType;
  icon_key: string;
};

/**
 * Request to create example from frame.
 */
export type FrameDTO = {
  file_id: number;
  time: number;
};

export type NewExclusionDTO = {
  file_id: number;
  template_id: number;
};
