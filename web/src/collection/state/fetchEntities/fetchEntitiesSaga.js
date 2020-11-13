import { call, put, select } from "redux-saga/effects";

/**
 * Default function to determine request params from the current collection
 * state. The `defaultParams` assumes the state has the same structure as
 * the example from the "./initialState.js" module.
 *
 * @param state - The state that contains params, limit and items.
 * @param resourceName - The state property name to hold entities.
 * @return {{offset: *, limit: number}}
 */
function defaultParams(state, resourceName = "items") {
  const { params, limit = 20 } = state;
  return { offset: state[resourceName].length, limit, ...params };
}

/**
 * Generic saga to fetch a slice from some entity collection.
 *
 * @param requestResource - The request function that will be used in {@link call} effect.
 * @param {function} stateSelector - The selector for the current entity collection state.
 * @param {function} success - The factory of the success action (must accept response data).
 * @param {function} failure - The factory for the failure action (must accept response error).
 * @param {function} getParams - The function to get request arguments.
 * @param {string} resourceName - The name of the state property that holds entities array.
 */
export default function* fetchEntitiesSaga({
  requestResource,
  stateSelector,
  success,
  failure,
  getParams = defaultParams,
  resourceName = "items",
}) {
  try {
    // Determine current query params
    const state = yield select(stateSelector);
    const args = getParams(state, resourceName);

    // Send request to permanent storage
    const resp = yield call(requestResource, args);

    // Handle error
    if (resp.failure) {
      console.error(`Error fetching ${resourceName}`, {
        args,
        state,
        requestResource,
        error: resp.error,
      });
      yield put(failure(resp.error));
      return;
    }

    // Update state
    yield put(success(resp.data));
  } catch (error) {
    console.error(error);
    yield put(failure(error));
  }
}
