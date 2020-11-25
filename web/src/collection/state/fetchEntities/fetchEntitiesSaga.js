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
function defaultArgs(state, resourceName = "items") {
  const { params, limit = 20 } = state;
  return { offset: state[resourceName].length, limit, ...params };
}

/**
 * Default function to get request params from the current state.
 * The function must return only those params that are necessary
 * to verify that the fetch results are relevant to the last request.
 *
 * @param state - Current state
 * @returns The request params as specified in current state.
 */
function defaultParams(state) {
  return state.params;
}

/**
 * Generic saga to fetch a slice from some entity collection.
 *
 * @param requestResource - The request function that will be used in {@link call} effect.
 * @param {function} stateSelector - The selector for the current entity collection state.
 * @param {function} success - The factory of the success action (must accept response data and request params).
 * @param {function} failure - The factory for the failure action (must accept response error).
 * @param {function} getArgs - The function to get request arguments.
 * @param {function} getParams - The function to get params to match request and response.
 * @param {string} resourceName - The name of the state property that holds entities array.
 */
export default function* fetchEntitiesSaga({
  requestResource,
  stateSelector,
  success,
  failure,
  getArgs = defaultArgs,
  getParams = defaultParams,
  resourceName = "items",
}) {
  // Extract state
  const state = yield select(stateSelector);

  try {
    // Determine current query params
    const args = getArgs(state, resourceName);

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
      yield put(failure({ error: resp.error, params: getParams(state) }));
      return;
    }

    // Update state
    yield put(success({ data: resp.data, params: getParams(state) }));
  } catch (error) {
    console.error(error);
    yield put(failure({ error, params: getParams(state) }));
  }
}
