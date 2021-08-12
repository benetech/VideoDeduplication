import { combineReducers } from "redux";
import filesRootReducer from "../files/root/reducer";
import fileClusterReducer from "../fileCluster/reducer";
import fileMatchesReducer from "../fileMatches/reducer";
import taskReducer from "../tasks/reducer";
import taskCacheReducer from "../taskCache/reducer";
import taskLogsReducer from "../taskLogs/reducer";
import objectCacheReducer from "../objects/reducer";
import presetReducer from "../presets/reducer";
import fileExclusionsCacheReducer from "../file-exclusions/reducer";
import templatesRootReducer from "../templates/root/reducer";

const appRootReducer = combineReducers({
  files: filesRootReducer,
  fileCluster: fileClusterReducer,
  fileMatches: fileMatchesReducer,
  tasks: taskReducer,
  taskCache: taskCacheReducer,
  taskLogs: taskLogsReducer,
  templates: templatesRootReducer,
  objectCache: objectCacheReducer,
  presets: presetReducer,
  fileExclusions: fileExclusionsCacheReducer,
});

export default appRootReducer;
