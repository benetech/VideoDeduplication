import initialState from "./initialState";
import {
  ACTION_ACQUIRE_TASK_QUERY,
  ACTION_QUERY_TASKS,
  ACTION_RELEASE_TASK_QUERY,
  ACTION_TASK_QUERY_FAILED,
  ACTION_UPDATE_TASK_QUERY,
} from "./actions";
import {
  queryCacheReducer,
  queryFailed,
  queryItems,
  releaseQuery,
  updateQuery,
  useQuery,
} from "../../../common/queryCache";
import { ACTION_DELETE_TASK, ACTION_UPDATE_TASK } from "../common/actions";
import { addEntity, deleteEntity } from "../../../common/queryCache/reducer";

/**
 * Check if the task satisfies query params.
 * @param {TaskFilters} params
 * @param {TaskEntity} task
 * @return {boolean}
 */
function checkFilters(params, task) {
  // Check task status filter
  if (params.status.length > 0 && !params.status.includes(task.status)) {
    return false;
  }
  // Check task type filter
  return !(params.type.length > 0 && !params.type.includes(task.request.type));
}

/**
 * Compare  by names.
 * @param {TaskEntity} taskA
 * @param {TaskEntity} taskB
 * @return {number}
 */
function dateComparator(taskA, taskB) {
  return taskB.submissionTime - taskA.submissionTime;
}

/**
 * Create task sort comparator from query params.
 * @return {function}
 */
function makeComparator() {
  return dateComparator;
}

/**
 * Task query cache reducer.
 *
 * @param {QueryCache} state
 * @param {TaskQueryAction|TaskAction} action
 * @return {QueryCache}
 */
export default function taskQueryReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_QUERY_TASKS:
      return queryCacheReducer(
        state,
        queryItems(action.params, action.request)
      );
    case ACTION_UPDATE_TASK_QUERY:
      return queryCacheReducer(
        state,
        updateQuery({
          params: action.params,
          items: action.tasks,
          total: action.total,
          request: action.request,
        })
      );
    case ACTION_TASK_QUERY_FAILED:
      return queryCacheReducer(
        state,
        queryFailed(action.params, action.request)
      );
    case ACTION_ACQUIRE_TASK_QUERY:
      return queryCacheReducer(state, useQuery(action.params));
    case ACTION_RELEASE_TASK_QUERY:
      return queryCacheReducer(state, releaseQuery(action.params));
    case ACTION_UPDATE_TASK:
      // This should replace existing task with a new one.
      return addEntity(state, action.task, checkFilters, makeComparator);
    case ACTION_DELETE_TASK:
      return deleteEntity(state, action.id);
    default:
      return state;
  }
}
