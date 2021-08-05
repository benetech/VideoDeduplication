/**
 * Presets API request & response transformer.
 */
export default class PresetsTransformer {
  constructor() {}

  /**
   * Convert list-presets filters
   * @typedef {{
   *   name: string|undefined,
   * }} PresetFilters
   * @param {PresetFilters} filters
   * @return {{}}
   */
  listParams(filters) {
    const params = {};
    if (filters?.name != null) {
      params.name = filters.name;
    }
    return params;
  }

  /**
   * Convert list presets results.
   * @param data server response.
   * @return {{total: number, presets: FilterPreset[], offset: number}}
   */
  presets(data) {
    return {
      offset: data.offset,
      total: data.total,
      presets: data.items.map((preset) => this.preset(preset)),
    };
  }

  /**
   * Convert preset DTO to preset object.
   * @param data preset DTO
   * @return {FilterPreset}
   */
  preset(data) {
    return {
      id: data.id,
      name: data.name,
      filters: data.filters,
    };
  }

  /**
   * Create new-preset request from preset object.
   * @param {FilterPreset} preset preset object to be created
   * @return {{}} new-preset DTO
   */
  newPresetDTO(preset) {
    return {
      name: preset.name,
      filters: preset.filters,
    };
  }

  /**
   * Create update-preset DTO from preset object.
   * @param {FilterPreset} preset preset object with updated attributes.
   * @return {{name, filters}} update-preset DTO
   */
  updatePresetDTO(preset) {
    return {
      name: preset.name,
      filters: preset.filters,
    };
  }
}
