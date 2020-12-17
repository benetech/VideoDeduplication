import makeEntityReducer from "../fetchEntities/makeEntityReducer";
import initialState from "./initialState";
import {
  ACTION_FETCH_TASK_SLICE,
  ACTION_FETCH_TASK_SLICE_FAILURE,
  ACTION_FETCH_TASK_SLICE_SUCCESS,
  ACTION_UPDATE_TASKS_PARAMS,
} from "./actions";

const taskReducer = makeEntityReducer({
  updateParams: ACTION_UPDATE_TASKS_PARAMS,
  fetchSlice: ACTION_FETCH_TASK_SLICE,
  fetchSliceSuccess: ACTION_FETCH_TASK_SLICE_SUCCESS,
  fetchSliceFailure: ACTION_FETCH_TASK_SLICE_FAILURE,
  initialState: initialState,
  resourceName: "tasks",
});

export default taskReducer;
