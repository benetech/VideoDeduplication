import { combineReducers } from "redux";
import filesRootReducer from "../files/root/reducer";

const appRootReducer = combineReducers({
  files: filesRootReducer,
});

export default appRootReducer;
