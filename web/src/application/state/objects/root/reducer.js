import { combineReducers } from "redux";
import objectsQueryReducer from "../queries/reducer";

const objectsRootReducer = combineReducers({
  queries: objectsQueryReducer,
});

export default objectsRootReducer;
