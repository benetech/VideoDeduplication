import { compose as reduxCompose, createStore, Store } from "redux";
import {
  appRootReducer,
  initialState as defaultInitialState,
} from "../../application/state/root";
import { AppState } from "../../application/state/root/initialState";

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof reduxCompose;
  }
}

/**
 * Create JusticeAI Redux store.
 */
export default function makeStore(initialState?: AppState): Store<AppState> {
  const compose =
    window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || reduxCompose;
  const preloadedState: AppState = initialState || defaultInitialState;
  return createStore(appRootReducer, preloadedState, compose());
}
