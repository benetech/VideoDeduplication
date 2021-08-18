import { combineReducers } from "redux";
import filesRootReducer from "../files/root/reducer";
import fileClusterReducer from "../fileCluster/reducer";
import fileMatchesReducer from "../fileMatches/reducer";
import presetReducer from "../presets/reducer";
import fileExclusionsCacheReducer from "../file-exclusions/reducer";
import templatesRootReducer from "../templates/root/reducer";
import tasksRootReducer from "../tasks/root/reducer";
import objectsRootReducer from "../objects/root/reducer";

const appRootReducer = combineReducers({
  files: filesRootReducer,
  fileCluster: fileClusterReducer,
  fileMatches: fileMatchesReducer,
  tasks: tasksRootReducer,
  templates: templatesRootReducer,
  objects: objectsRootReducer,
  presets: presetReducer,
  fileExclusions: fileExclusionsCacheReducer,
});

export default appRootReducer;
