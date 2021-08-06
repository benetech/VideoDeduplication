import lodash from "lodash";
import initialState from "./initialState";
import {
  ACTION_SET_COLL_BLUR,
  ACTION_SET_COLL_LIST_TYPE,
  ACTION_SET_COLL_PARAMS,
  ACTION_UPDATE_COLL_PARAMS,
} from "./actions";

/**
 * Array merge customizer which simply replaces array with a new one.
 */
function replaceArrays(objValue, srcValue) {
  if (lodash.isArray(objValue)) {
    return srcValue;
  }
}

/**
 * Files main collection reducer.
 *
 * Main collection is a list of files displayed on the "Collection" root page.
 *
 * @param {CollState} state
 * @param {{type:string}} action
 * @return {CollState}
 */
export default function collReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_SET_COLL_PARAMS:
      return { ...state, params: action.params };
    case ACTION_UPDATE_COLL_PARAMS: {
      const updatedParams = lodash.mergeWith(
        {},
        state.params,
        action.params,
        replaceArrays
      );
      return { ...state, params: updatedParams };
    }
    case ACTION_SET_COLL_BLUR:
      return { ...state, blur: action.blur };
    case ACTION_SET_COLL_LIST_TYPE:
      return { ...state, listType: action.listType };
    default:
      return state;
  }
}
