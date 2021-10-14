import { Preset, PresetFilters } from "../../../model/Preset";
import { QueryParams, QueryResultsDTO } from "../dto/query";
import { ListRequest, ListResults } from "../../ServerAPI";
import { NewPresetDTO, PresetDTO, UpdatePresetDTO } from "../dto/presets";
import { Transient, Updates } from "../../../lib/entity/Entity";

export default class PresetTransformer {
  listParams(filters: PresetFilters): QueryParams {
    const params: QueryParams = {};
    if (filters?.name) {
      params.name = filters.name;
    }
    return params;
  }

  presets(
    data: QueryResultsDTO<PresetDTO>,
    request: ListRequest<PresetFilters>
  ): ListResults<Preset, PresetFilters> {
    return {
      request,
      total: data.total,
      items: data.items.map((item) => this.preset(item)),
    };
  }

  preset(data: PresetDTO): Preset {
    return data; // No differences so far...
  }

  newPresetDTO(preset: Transient<Preset>): NewPresetDTO {
    return preset; // No differences so far...
  }

  updatePresetDTO(preset: Updates<Preset>): UpdatePresetDTO {
    const result: UpdatePresetDTO = {};
    if (preset.name) {
      result.name = preset.name;
    }
    if (preset.filters) {
      result.filters = preset.filters;
    }
    return result;
  }
}
