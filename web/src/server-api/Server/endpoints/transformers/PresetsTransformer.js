/**
 * Presets API request & response transformer.
 */
export default class PresetsTransformer {
  constructor() {}

  /**
   * @typedef {{
   *   name: string|undefined,
   * }} PresetFilters
   */

  /**
   * Convert list-presets filters
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
   * @typedef {{
   *   request: ListPresetsOptions,
   *   items: FilterPreset[],
   *   total: number,
   * }} ListPresetsResults
   */

  /**
   * Convert list presets results.
   * @param data server response.
   * @param {ListPresetsOptions} request
   * @return {ListPresetsResults}
   */
  presets(data, request) {
    return {
      request,
      total: data.total,
      items: data.items.map((preset) => this.preset(preset)),
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
