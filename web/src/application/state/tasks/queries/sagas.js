import { call, put, select } from "redux-saga/effects";
import { taskQueryFailed, updateTaskQuery } from "./actions";
import { selectTaskQuery } from "../../root/selectors";

/**
 * Do load tasks from the backend.
 * @param {Server} server server API
 * @param {TaskQueryAction} action query files action
 */
export function* loadTasksSaga(server, action) {
  const query = yield select(selectTaskQuery(action.params));

  // Skip dismissed requests
  if (query?.request !== action.request) {
    return;
  }

  try {
    // Send request to the server
    const { total, items: tasks } = yield call(
      [server.tasks, server.tasks.list],
      {
        limit: 1000,
        offset: query.items.length,
        filters: action.params,
      }
    );

    // Update query
    yield put(
      updateTaskQuery({
        params: action.params,
        tasks,
        total,
        request: action.request,
      })
    );
  } catch (error) {
    console.error("loadTasksSaga failed", error);
    yield put(taskQueryFailed(action.params, action.request));
  }
}
