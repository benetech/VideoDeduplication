import { Transient } from "../../../lib/entity/Entity";
import { FileFilters } from "../../../model/VideoFile";

export type PresetDTO = {
  id: number;
  name: string;
  filters: FileFilters;
};

export type NewPresetDTO = Transient<PresetDTO>;

export type UpdatePresetDTO = Partial<NewPresetDTO>;
