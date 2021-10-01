import lodash from "lodash";
import initialState, { CollState } from "./initialState";
import { Action } from "redux";
import { CollActions, isCollAction } from "./actions";

/**
 * Array merge customizer which simply replaces array with a new one.
 */
function replaceArrays(objValue: any, srcValue: any): any {
  if (lodash.isArray(objValue)) {
    return srcValue;
  }
}

/**
 * Files main collection reducer.
 *
 * Main collection is a list of files displayed on the "Collection" root page.
 */
export default function collReducer(
  state: CollState = initialState,
  action: Action
): CollState {
  if (!isCollAction(action)) {
    return state;
  }

  switch (action.type) {
    case CollActions.SET_PARAMS:
      return { ...state, params: action.params };
    case CollActions.UPDATE_PARAMS: {
      const updatedParams = lodash.mergeWith(
        {},
        state.params,
        action.params,
        replaceArrays
      );
      return { ...state, params: updatedParams };
    }
    case CollActions.SET_BLUR:
      return { ...state, blur: action.blur };
    case CollActions.SET_LIST_TYPE:
      return { ...state, listType: action.listType };
  }
}
