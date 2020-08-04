import React, { useMemo } from "react";
import "fontsource-roboto";
import "lato-font";
import PropTypes from "prop-types";
import CssBaseline from "@material-ui/core/CssBaseline";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import ApplicationLayout from "./ApplicationLayout";
import CustomScrollbar from "../CustomScrollbar";
import { IntlProvider } from "react-intl";
import { Provider as StoreProvider } from "react-redux";
import { ServerProvider } from "../../../server-api/context";
import { applyMiddleware, compose as reduxCompose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import {
  appRootReducer,
  appRootSaga,
  initialState as defaultInitialState,
} from "../../state";

function makeStore(initialState, server) {
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

/**
 * Application root component.
 */
function Application(props) {
  const { server, initialState, locale, theme, className } = props;

  const store = useMemo(() => makeStore(initialState, server), undefined);

  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <CustomScrollbar>
          <IntlProvider
            defaultLocale="en-US"
            locale={locale.locale}
            messages={locale.messages}
          >
            <ServerProvider server={server}>
              <StoreProvider store={store}>
                <ApplicationLayout className={className} />
              </StoreProvider>
            </ServerProvider>
          </IntlProvider>
        </CustomScrollbar>
      </ThemeProvider>
    </React.Fragment>
  );
}

Application.propTypes = {
  server: PropTypes.object.isRequired,
  initialState: PropTypes.object,
  locale: PropTypes.shape({
    locale: PropTypes.string.isRequired,
    messages: PropTypes.object.isRequired,
  }).isRequired,
  theme: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default Application;
