import { combineReducers } from "redux";
import fileCacheReducer from "../fileCache/reducer";
import collReducer from "../coll/reducer";
import filesQueryReducer from "../queries/reducer";

const filesRootReducer = combineReducers({
  cache: fileCacheReducer,
  coll: collReducer,
  queries: filesQueryReducer,
});

export default filesRootReducer;
