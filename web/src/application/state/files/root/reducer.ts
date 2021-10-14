import { combineReducers } from "redux";
import collReducer from "../coll/reducer";

const filesRootReducer = combineReducers({
  coll: collReducer,
});

export default filesRootReducer;
