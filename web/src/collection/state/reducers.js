import { combineReducers } from "redux";
import fileCacheReducer from "./fileCache/reducer";
import fileMatchesReducer from "./fileMatches/reducer";
import fileClusterReducer from "./fileCluster/reducer";
import fileListReducer from "./fileList/reducer";
import taskReducer from "./tasks/reducer";
import taskCacheReducer from "./taskCache/reducer";
import taskLogsReducer from "./taskLogs/reducer";
import templateReducer from "./templates/reducer";

const collRootReducer = combineReducers({
  fileList: fileListReducer,
  fileCache: fileCacheReducer,
  fileCluster: fileClusterReducer,
  fileMatches: fileMatchesReducer,
  tasks: taskReducer,
  taskCache: taskCacheReducer,
  taskLogs: taskLogsReducer,
  templates: templateReducer,
});

export default collRootReducer;
