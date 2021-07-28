import { combineReducers } from "redux";
import fileListReducer from "../files/fileList/reducer";
import fileCacheReducer from "../files/fileCache/reducer";
import fileClusterReducer from "../fileCluster/reducer";
import fileMatchesReducer from "../fileMatches/reducer";
import taskReducer from "../tasks/reducer";
import taskCacheReducer from "../taskCache/reducer";
import taskLogsReducer from "../taskLogs/reducer";
import templateReducer from "../templates/reducer";
import objectCacheReducer from "../../objects/state/reducer";
import presetReducer from "../presets/reducer";
import fileExclusionsCacheReducer from "../../file-exclusion/state/reducer";

const appRootReducer = combineReducers({
  fileList: fileListReducer,
  fileCache: fileCacheReducer,
  fileCluster: fileClusterReducer,
  fileMatches: fileMatchesReducer,
  tasks: taskReducer,
  taskCache: taskCacheReducer,
  taskLogs: taskLogsReducer,
  templates: templateReducer,
  objectCache: objectCacheReducer,
  presets: presetReducer,
  fileExclusions: fileExclusionsCacheReducer,
});

export default appRootReducer;
