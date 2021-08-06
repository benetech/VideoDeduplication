import { makeServerError } from "../ServerError";
import PresetsTransformer from "./transformers/PresetsTransformer";
import getEntityId from "../../../lib/helpers/getEntityId";

/**
 * Client for presets API endpoint.
 */
export default class PresetsEndpoint {
  constructor(axios, transform) {
    this.axios = axios;
    this.transform = transform || new PresetsTransformer();
  }

  /**
   * Create new preset
   * @param {FilterPreset} preset
   * @return {Promise<FilterPreset>}
   */
  async create(preset) {
    try {
      const newPresetDTO = this.transform.newPresetDTO(preset);
      const response = await this.axios.post(
        "/files/filter-presets/",
        JSON.stringify(newPresetDTO),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.preset(response.data);
    } catch (error) {
      throw makeServerError("Create preset error.", error, { preset });
    }
  }

  /**
   * List presets.
   * @param {{
   *   limit: number|undefined,
   *   offset: number|undefined,
   *   filters: PresetFilters,
   * }} options
   * @return {Promise<{total:number, presets: FilterPreset[], offset: number}>}
   */
  async list(options = {}) {
    try {
      const { limit = 1000, offset = 0, filters = {} } = options;
      const response = await this.axios.get("/files/filter-presets/", {
        params: {
          limit,
          offset,
          ...this.transform.listParams(filters),
        },
      });
      return this.transform.presets(response.data);
    } catch (error) {
      throw makeServerError("Fetch presets error.", error, { options });
    }
  }

  /**
   * Get preset by id.
   * @param {number|string} id
   * @return {Promise<FilterPreset>}
   */
  async get(id) {
    try {
      const response = await this.axios.get(`/files/filter-presets/${id}`);
      return this.transform.preset(response.data);
    } catch (error) {
      throw makeServerError("Fetch preset error.", error, { id });
    }
  }

  /**
   * Update preset.
   * @param {FilterPreset} preset preset with updated attributes
   * @return {Promise<FilterPreset>}
   */
  async update(preset) {
    try {
      const response = await this.axios.patch(
        `/files/filter-presets/${preset.id}`,
        JSON.stringify(this.transform.updatePresetDTO(preset)),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.preset(response.data);
    } catch (error) {
      throw makeServerError("Update preset error.", error, { preset });
    }
  }

  /**
   * Delete preset
   * @param {number|string|{id}} preset
   * @return {Promise<void>}
   */
  async delete(preset) {
    try {
      await this.axios.delete(`/files/filter-presets/${getEntityId(preset)}`);
    } catch (error) {
      throw makeServerError("Delete preset error.", error, { preset });
    }
  }
}
