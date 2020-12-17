import fileCacheReducer from "./fileCache/reducer";
import fileMatchesReducer from "./fileMatches/reducer";
import fileClusterReducer from "./fileCluster/reducer";
import { combineReducers } from "redux";
import fileListReducer from "./fileList/reducer";
import taskReducer from "./tasks/reducer";

const collRootReducer = combineReducers({
  fileList: fileListReducer,
  fileCache: fileCacheReducer,
  fileCluster: fileClusterReducer,
  fileMatches: fileMatchesReducer,
  tasks: taskReducer,
});

export default collRootReducer;
