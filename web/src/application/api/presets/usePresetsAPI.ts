import { useServer } from "../../../server-api/context";
import {
  ComparatorFn,
  stringComparator,
} from "../../../lib/helpers/comparators";
import {
  useCreateEntity,
  useDeleteEntity,
  useUpdateEntity,
} from "../../common/useEntityMutation";
import { Preset, PresetFilters } from "../../../model/Preset";
import { ListRequest } from "../../../server-api/ServerAPI";
import { CreateFn, DeleteFn, UpdateFn } from "../../common/model";

/**
 * Check if the preset satisfies query params.
 */
function checkFilters(
  request: ListRequest<PresetFilters>,
  preset: Preset
): boolean {
  const { filters } = request;
  return filters?.name == null || preset.name.includes(filters.name);
}

/**
 * Create presets sort comparator from query params.
 */
function makeComparator(): ComparatorFn<Preset> {
  return (first, second) => stringComparator(first.name, second.name);
}

/**
 * Get a callback to update preset.
 */
export function useUpdatePreset(): UpdateFn<Preset> {
  const server = useServer();
  const mutation = useUpdateEntity<Preset, PresetFilters>({
    updateFn: (updatedPreset) => server.presets.update(updatedPreset),
    checkFilters,
    makeComparator,
    updateKeys: ["presets"],
  });

  return mutation.mutateAsync;
}

/**
 * Get a callback to create preset.
 */
export function useCreatePreset(): CreateFn<Preset> {
  const server = useServer();
  const mutation = useCreateEntity<Preset, PresetFilters>({
    createFn: (preset) => server.presets.create(preset),
    checkFilters,
    makeComparator,
    updateKeys: ["presets"],
  });

  return mutation.mutateAsync;
}

/**
 * Get a callback to delete preset.
 */
export function useDeletePreset(): DeleteFn<Preset> {
  const server = useServer();

  const mutation = useDeleteEntity<Preset, PresetFilters>({
    deleteFn: (preset) => server.presets.delete(preset),
    checkFilters,
    makeComparator,
    updateKeys: ["presets"],
  });

  return mutation.mutateAsync;
}

export type UsePresetsAPI = {
  createPreset: CreateFn<Preset>;
  updatePreset: UpdateFn<Preset>;
  deletePreset: DeleteFn<Preset>;
};

/**
 * Get presets API.
 */
export default function usePresetsAPI(): UsePresetsAPI {
  const createPreset = useCreatePreset();
  const updatePreset = useUpdatePreset();
  const deletePreset = useDeletePreset();
  return { createPreset, updatePreset, deletePreset };
}
