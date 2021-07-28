import { combineReducers } from "redux";
import fileListReducer from "../fileList/reducer";
import fileCacheReducer from "../fileCache/reducer";

const filesRootReducer = combineReducers({
  fileList: fileListReducer,
  cache: fileCacheReducer,
});

export default filesRootReducer;
