import { call, put, select } from "redux-saga/effects";
import { templatesQueryFailed, updateTemplatesQuery } from "./actions";
import { selectTemplatesQuery } from "../../root/selectors";

/**
 * Do load templates from the backend.
 * @param {Server} server server API
 * @param {TemplatesQueryAction} action query files action
 */
export function* loadTemplatesSaga(server, action) {
  try {
    const query = yield select(selectTemplatesQuery(action.params));

    // Skip dismissed requests
    if (query?.request !== action.request) {
      return;
    }

    // Send request to the server
    const { total, items: templates } = yield call(
      [server.templates, server.templates.list],
      {
        limit: 100,
        offset: query.items.length,
        filters: action.params,
      }
    );

    // Update query
    yield put(
      updateTemplatesQuery({
        params: action.params,
        templates,
        total,
        request: action.request,
      })
    );
  } catch (error) {
    console.error("loadTemplatesSaga failed", error);
    yield put(templatesQueryFailed(action.params, action.request));
  }
}
