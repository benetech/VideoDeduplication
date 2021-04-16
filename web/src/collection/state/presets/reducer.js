import initialState from "./initialState";
import extendEntityList from "../helpers/extendEntityList";
import lodash from "lodash";
import {
  ACTION_ADD_PRESETS,
  ACTION_DELETE_PRESET,
  ACTION_SET_PRESETS,
  ACTION_UPDATE_PRESET,
} from "./actions";

function presetReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_ADD_PRESETS:
      return {
        ...state,
        presets: extendEntityList(state.presets, action.presets),
      };
    case ACTION_SET_PRESETS:
      return {
        ...state,
        presets: [...action.presets],
      };
    case ACTION_UPDATE_PRESET: {
      const updatedPresets = state.presets.map((preset) => {
        if (preset.id === action.preset.id) {
          return lodash.merge({}, preset, action.preset);
        }
        return preset;
      });
      return {
        ...state,
        presets: updatedPresets,
      };
    }
    case ACTION_DELETE_PRESET:
      return {
        ...state,
        presets: state.presets.filter(
          (preset) => preset.id !== action.presetId
        ),
      };
    default:
      return state;
  }
}

export default presetReducer;
