import { combineReducers } from "redux";
import templateCacheReducer from "../cache/reducer";
import templatesQueryReducer from "../queries/reducer";

const templatesRootReducer = combineReducers({
  cache: templateCacheReducer,
  queries: templatesQueryReducer,
});

export default templatesRootReducer;
