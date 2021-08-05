import lodash from "lodash";
import initialState from "./initialState";
import {
  ACTION_SET_COLL_BLUR,
  ACTION_SET_COLL_LIST_TYPE,
  ACTION_SET_COLL_PARAMS,
  ACTION_UPDATE_COLL_PARAMS,
} from "./actions";

/**
 * Files collection reducer.
 * @param {CollState} state
 * @param {{type:string}} action
 * @return {CollState}
 */
export default function collReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_SET_COLL_PARAMS:
      return { ...state, params: action.params };
    case ACTION_UPDATE_COLL_PARAMS: {
      const updatedParams = lodash.merge({}, state.params, action.params);
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
