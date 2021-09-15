import { useServer } from "../../../server-api/context";
import { stringComparator } from "../../../lib/helpers/comparators";
import {
  useCreateEntity,
  useDeleteEntity,
  useUpdateEntity,
} from "../../common/react-query/useEntityMutation";

/**
 * Check if the preset satisfies query params.
 * @param {{
 *   filters: PresetFilters
 * }} request
 * @param {PresetEntity} preset
 * @return {boolean}
 */
function checkFilters(request, preset) {
  const { filters } = request;
  return filters?.name == null || preset.name.includes(filters.name);
}

/**
 * Create presets sort comparator from query params.
 * @return {(function(PresetEntity,PresetEntity): number)}
 */
function makeComparator() {
  return (first, second) => stringComparator(first.name, second.name);
}

/**
 * Get a callback to update preset.
 * @return {{
 *   updatePreset: function
 * }}
 */
export function useUpdatePreset() {
  const server = useServer();
  const mutation = useUpdateEntity({
    mutationFn: (updatedPreset) => server.presets.update(updatedPreset),
    checkFilters,
    makeComparator,
    updateKeys: ["presets"],
  });

  return {
    updatePreset: mutation.mutateAsync,
  };
}

/**
 * Get a callback to create preset.
 * @return {{
 *   createPreset: function
 * }}
 */
export function useCreatePreset() {
  const server = useServer();
  const mutation = useCreateEntity({
    mutationFn: (preset) => server.presets.create(preset),
    checkFilters,
    makeComparator,
    updateKeys: ["presets"],
    optimistic: false,
  });

  return {
    createPreset: mutation.mutateAsync,
  };
}

/**
 * Get a callback to delete preset.
 * @return {{
 *   deletePreset: function
 * }}
 */
export function useDeletePreset() {
  const server = useServer();

  const mutation = useDeleteEntity({
    mutationFn: (preset) => server.presets.delete(preset),
    checkFilters,
    makeComparator,
    updateKeys: ["presets"],
  });

  return {
    deletePreset: mutation.mutateAsync,
  };
}

/**
 * Get presets API.
 * @param {MutationOptions} options
 * @return {{
 *   createPreset: function,
 *   updatePreset: function,
 *   deletePreset: function
 * }}
 */
export default function usePresetsAPI(options) {
  const { createPreset } = useCreatePreset(options);
  const { updatePreset } = useUpdatePreset(options);
  const { deletePreset } = useDeletePreset(options);
  return { createPreset, updatePreset, deletePreset };
}
