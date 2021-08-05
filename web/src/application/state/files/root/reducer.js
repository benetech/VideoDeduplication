import { combineReducers } from "redux";
import fileListReducer from "../fileList/reducer";
import fileCacheReducer from "../fileCache/reducer";
import collReducer from "../coll/reducer";
import filesQueryReducer from "../queries/reducer";

const filesRootReducer = combineReducers({
  fileList: fileListReducer,
  cache: fileCacheReducer,
  coll: collReducer,
  queries: filesQueryReducer,
});

export default filesRootReducer;
