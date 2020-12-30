import initialState from "./initialState";
import { ACTION_CACHE_TASK } from "./actions";
import { ACTION_UPDATE_TASK } from "../tasks/actions";

/**
 * Root reducer for task cache.
 */
export default function taskCacheReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_CACHE_TASK: {
      const tasks = { ...state.tasks, [action.task.id]: action.task };
      const history = [
        action.task.id,
        ...state.history.filter((id) => id !== action.task.id),
      ];
      if (history.length > state.maxSize) {
        const evicted = history.pop();
        delete tasks[evicted];
      }
      return { ...state, history, tasks };
    }
    case ACTION_UPDATE_TASK: {
      const existing = state.tasks[action.task.id];
      if (existing == null) {
        return state;
      } else {
        const updated = { ...existing, ...action.task };
        const tasks = { ...state.tasks, [action.task.id]: updated };
        return { ...state, tasks };
      }
    }
    default:
      return state;
  }
}
