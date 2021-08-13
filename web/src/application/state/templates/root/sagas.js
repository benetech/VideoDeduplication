import { put, takeEvery } from "redux-saga/effects";
import { ACTION_QUERY_TEMPLATES } from "../queries/actions";
import { loadTemplatesSaga } from "../queries/sagas";
import TaskRequestTypes from "../../../../prop-types/TaskRequestTypes";
import { ACTION_UPDATE_TASK } from "../../tasks/actions";
import { updateTemplate } from "../common/actions";

/**
 * Check if the action is the match-templates task results.
 * @param {TaskAction} action
 */
function isMatchTemplatesResults(action) {
  return (
    action.type === ACTION_UPDATE_TASK &&
    action.task.request.type === TaskRequestTypes.MATCH_TEMPLATES &&
    action.task.result?.fileCounts
  );
}

/**
 * Update template matched file counts on match-templates task finish.
 * @param {TaskAction} action
 */
function* updateTemplatesSaga(action) {
  try {
    const fileCounts = action.task.result.fileCounts;
    for (const { templateId: id, fileCount } of fileCounts) {
      yield put(updateTemplate({ id, fileCount }));
    }
  } catch (error) {
    console.error("Update-templates saga error", error);
  }
}

/**
 * Templates query cache sage.
 * @param {Server} server server API
 */
export default function* templatesRootSaga(server) {
  yield takeEvery(ACTION_QUERY_TEMPLATES, loadTemplatesSaga, server);
  yield takeEvery(isMatchTemplatesResults, updateTemplatesSaga);
}
