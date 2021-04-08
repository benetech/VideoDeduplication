import { takeEvery, put } from "redux-saga/effects";
import { ACTION_UPDATE_TASK } from "../tasks/actions";
import TaskRequest from "../tasks/TaskRequest";
import { updateTemplate } from "./actions";

/**
 * Get file counts from MATCH_TEMPLATES task-update action.
 */
function fileCounts(action) {
  if (action.task.request.type !== TaskRequest.MATCH_TEMPLATES) {
    return [];
  }
  return action.task.result?.file_counts || [];
}

function* updateTemplatesSaga(action) {
  try {
    for (const { template: id, file_count: fileCount } of fileCounts(action)) {
      yield put(updateTemplate({ id, fileCount }));
    }
  } catch (error) {
    console.error("Update-templates saga error", error);
  }
}

/**
 * Initialize template-related sagas...
 */
export default function* templateRootSaga() {
  // Handle template updates
  yield takeEvery(ACTION_UPDATE_TASK, updateTemplatesSaga);
}
