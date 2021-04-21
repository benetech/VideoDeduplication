export const ACTION_ADD_PRESETS = "coll.ADD_PRESETS";

export function addPresets(presets, total) {
  return { type: ACTION_ADD_PRESETS, presets, total };
}

export const ACTION_SET_PRESETS = "coll.SET_PRESETS";

export function setPresets(presets, total) {
  return { type: ACTION_SET_PRESETS, presets, total };
}

export const ACTION_UPDATE_PRESET = "coll.UPDATE_PRESET";

export function updatePreset(preset) {
  return { type: ACTION_UPDATE_PRESET, preset };
}

export const ACTION_DELETE_PRESET = "coll.DELETE_PRESET";

export function deletePreset(preset) {
  return { type: ACTION_DELETE_PRESET, preset };
}

export const ACTION_ADD_PRESET = "coll.ADD_PRESET";

export function addPreset(preset) {
  return { type: ACTION_ADD_PRESET, preset };
}
