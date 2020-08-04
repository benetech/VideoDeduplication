import {
  collRootReducer,
  initialState as collInitialState,
} from "../../collection/state";
import { combineReducers } from "redux";

export const initialState = {
  coll: collInitialState,
};

export const appRootReducer = combineReducers({
  coll: collRootReducer,
});
