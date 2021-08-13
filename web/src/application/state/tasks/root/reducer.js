import { combineReducers } from "redux";
import taskCacheReducer from "../cache/reducer";
import taskQueryReducer from "../queries/reducer";

const tasksRootReducer = combineReducers({
  cache: taskCacheReducer,
  queries: taskQueryReducer,
});

export default tasksRootReducer;
