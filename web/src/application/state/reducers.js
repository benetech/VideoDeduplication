import { combineReducers } from "redux";
import collRootReducer from "../../collection/state/reducers";

const appRootReducer = combineReducers({
  coll: collRootReducer,
});

export default appRootReducer;
