import { FileFilters } from "./File";

/**
 * Preset query filters.
 */
export type PresetFilters = {
  name?: string;
};

/**
 * File filter preset.
 */
export type Preset = {
  id: number;
  name: string;
  filters: FileFilters;
};
