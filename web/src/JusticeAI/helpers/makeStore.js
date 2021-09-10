import { compose as reduxCompose, createStore } from "redux";
import {
  appRootReducer,
  initialState as defaultInitialState,
} from "../../application/state/root";

/**
 * Create JusticeAI Redux store.
 * @param {Object} initialState initial application state
 * @return {Store}
 */
export default function makeStore(initialState) {
  const compose =
    window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || reduxCompose;
  const preloadedState = initialState || defaultInitialState;
  return createStore(appRootReducer, preloadedState, compose());
}
