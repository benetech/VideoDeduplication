import { combineReducers } from "redux";
import taskCacheReducer from "../cache/reducer";
import taskQueryReducer from "../queries/reducer";
import taskLogsReducer from "../logs/reducer";

const tasksRootReducer = combineReducers({
  cache: taskCacheReducer,
  queries: taskQueryReducer,
  logs: taskLogsReducer,
});

export default tasksRootReducer;
