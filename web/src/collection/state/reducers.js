import { combineReducers } from "redux";
import fileCacheReducer from "./fileCache/reducer";
import fileMatchesReducer from "./fileMatches/reducer";
import fileClusterReducer from "./fileCluster/reducer";
import fileListReducer from "./fileList/reducer";
import taskReducer from "./tasks/reducer";
import taskCacheReducer from "./taskCache/reducer";
import taskLogsReducer from "./taskLogs/reducer";
import templateReducer from "./templates/reducer";
import objectCacheReducer from "./objectCache/reducer";

const collRootReducer = combineReducers({
  fileList: fileListReducer,
  fileCache: fileCacheReducer,
  fileCluster: fileClusterReducer,
  fileMatches: fileMatchesReducer,
  tasks: taskReducer,
  taskCache: taskCacheReducer,
  taskLogs: taskLogsReducer,
  templates: templateReducer,
  objectCache: objectCacheReducer,
});

export default collRootReducer;
