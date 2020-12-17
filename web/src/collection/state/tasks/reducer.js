import makeEntityReducer from "../fetchEntities/makeEntityReducer";
import initialState from "./initialState";
import {
  ACTION_DELETE_TASK,
  ACTION_FETCH_TASK_SLICE,
  ACTION_FETCH_TASK_SLICE_FAILURE,
  ACTION_FETCH_TASK_SLICE_SUCCESS,
  ACTION_UPDATE_TASK,
  ACTION_UPDATE_TASKS_PARAMS,
} from "./actions";

const defaultReducer = makeEntityReducer({
  updateParams: ACTION_UPDATE_TASKS_PARAMS,
  fetchSlice: ACTION_FETCH_TASK_SLICE,
  fetchSliceSuccess: ACTION_FETCH_TASK_SLICE_SUCCESS,
  fetchSliceFailure: ACTION_FETCH_TASK_SLICE_FAILURE,
  initialState: initialState,
  resourceName: "tasks",
});

function taskReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
      };
    case ACTION_UPDATE_TASK: {
      const existing = state.tasks.find((task) => task.id === action.task.id);
      const updated = { ...existing, ...action.task };
      let updatedTasks;
      if (existing != null) {
        updatedTasks = state.tasks.map((task) =>
          task.id === updated.id ? updated : task
        );
      } else {
        updatedTasks = [...state.tasks, updated];
      }
      return {
        ...state,
        tasks: updatedTasks,
      };
    }
    default:
      return defaultReducer(state, action);
  }
}

export default taskReducer;
