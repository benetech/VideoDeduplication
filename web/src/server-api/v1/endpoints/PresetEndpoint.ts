import PresetTransformer from "../transform/PresetTransformer";
import { Preset, PresetFilters } from "../../../model/Preset";
import { AxiosInstance } from "axios";
import { makeServerError } from "../../ServerError";
import {
  ListOptions,
  ListRequest,
  ListResults,
  PresetsAPI,
} from "../../ServerAPI";
import { QueryResultsDTO } from "../dto/query";
import getEntityId from "../../../lib/entity/getEntityId";
import { PresetDTO } from "../dto/presets";
import { Transient, Updates } from "../../../lib/entity/Entity";

export default class PresetEndpoint implements PresetsAPI {
  private readonly transform: PresetTransformer;
  private readonly axios: AxiosInstance;

  constructor(axios: AxiosInstance, transform?: PresetTransformer) {
    this.axios = axios;
    this.transform = transform || new PresetTransformer();
  }

  async create(preset: Transient<Preset>): Promise<Preset> {
    try {
      const newPresetDTO = this.transform.newPresetDTO(preset);
      const response = await this.axios.post<PresetDTO>(
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
      throw makeServerError("Error creating preset", error, { preset });
    }
  }

  /**
   * List presets.
   */
  async list(
    options: ListOptions<PresetFilters> = {}
  ): Promise<ListResults<Preset, PresetFilters>> {
    try {
      const request = PresetEndpoint.completeRequest(options);
      const { limit, offset, filters } = request;
      const response = await this.axios.get<QueryResultsDTO<PresetDTO>>(
        "/files/filter-presets/",
        {
          params: {
            limit,
            offset,
            ...this.transform.listParams(filters),
          },
        }
      );
      return this.transform.presets(response.data, request);
    } catch (error) {
      throw makeServerError("Error listing presets", error, { options });
    }
  }

  /**
   * Get preset by id.
   */
  async get(id: Preset["id"]): Promise<Preset> {
    try {
      const response = await this.axios.get<PresetDTO>(
        `/files/filter-presets/${id}`
      );
      return this.transform.preset(response.data);
    } catch (error) {
      throw makeServerError("Error getting preset", error, { id });
    }
  }

  /**
   * Update preset.
   */
  async update(preset: Updates<Preset>): Promise<Preset> {
    try {
      const response = await this.axios.patch<PresetDTO>(
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
      throw makeServerError("Error updating preset", error, { preset });
    }
  }

  /**
   * Delete preset
   */
  async delete(preset: Preset | Preset["id"]): Promise<void> {
    try {
      await this.axios.delete(`/files/filter-presets/${getEntityId(preset)}`);
    } catch (error) {
      throw makeServerError("Error getting preset", error, { preset });
    }
  }

  private static completeRequest(
    options: ListOptions<PresetFilters>
  ): ListRequest<PresetFilters> {
    return Object.assign(
      {
        limit: 1000,
        offset: 0,
        filters: {},
        fields: [],
      },
      options
    );
  }
}
