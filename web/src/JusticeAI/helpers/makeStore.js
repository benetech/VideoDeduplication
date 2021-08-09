import createSagaMiddleware from "redux-saga";
import { applyMiddleware, compose as reduxCompose, createStore } from "redux";
import {
  appRootReducer,
  appRootSaga,
  initialState as defaultInitialState,
} from "../../application/state/root";

/**
 * Create JusticeAI Redux store.
 * @param {Object} initialState initial application state
 * @param server server API client.
 * @return {Store}
 */
export default function makeStore(initialState, server) {
  const sagaMiddleware = createSagaMiddleware();
  const compose =
    window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || reduxCompose;

  const preloadedState = initialState || defaultInitialState;

  const store = createStore(
    appRootReducer,
    preloadedState,
    compose(applyMiddleware(sagaMiddleware))
  );

  // Execute root saga
  sagaMiddleware.run(appRootSaga, server);

  return store;
}
