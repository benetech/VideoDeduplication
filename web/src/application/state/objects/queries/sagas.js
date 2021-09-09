import { call, put, select } from "redux-saga/effects";
import { objectsQueryFailed, updateObjectsQuery } from "./actions";
import { selectObjectsQuery } from "../../root/selectors";

/**
 * Do load template-matches (objects) from the backend.
 * @param {Server} server server API
 * @param {ObjectsQueryAction} action query objects action
 */
export function* loadObjectsSaga(server, action) {
  try {
    const query = yield select(selectObjectsQuery(action.params));

    // Skip dismissed requests
    if (query?.request !== action.request) {
      return;
    }

    // Send request to the server
    const { total, items: objects } = yield call(
      [server.templateMatches, server.templateMatches.list],
      {
        limit: 100,
        offset: query.items.length,
        filters: action.params,
      }
    );

    // Update query
    yield put(
      updateObjectsQuery({
        params: action.params,
        objects,
        total,
        request: action.request,
      })
    );
  } catch (error) {
    console.error("loadObjectsSaga failed", error);
    yield put(objectsQueryFailed(action.params, action.request));
  }
}
