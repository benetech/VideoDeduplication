import React, { useMemo } from "react";
import PropTypes from "prop-types";
import CssBaseline from "@material-ui/core/CssBaseline";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import CustomScrollbar from "../components/app/CustomScrollbar";
import { IntlProvider } from "react-intl";
import { ServerProvider } from "../server-api/context";
import { Provider as StoreProvider } from "react-redux";
import makeStore from "./helpers/makeStore";
import { QueryClient, QueryClientProvider } from "react-query";
import HandleSocketEvents from "./HandleSocketEvents";

/**
 * JusticeAI application API provider.
 */
function JusticeAIProvider(props) {
  const { server, initialState, locale, theme, children } = props;
  const store = useMemo(() => makeStore(initialState));
  const queryClient = props.queryClient || new QueryClient();

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
            <QueryClientProvider client={queryClient}>
              <ServerProvider server={server}>
                <HandleSocketEvents />
                <StoreProvider store={store}>{children}</StoreProvider>
              </ServerProvider>
            </QueryClientProvider>
          </IntlProvider>
        </CustomScrollbar>
      </ThemeProvider>
    </React.Fragment>
  );
}

JusticeAIProvider.propTypes = {
  queryClient: PropTypes.object,
  /**
   * Server API.
   */
  server: PropTypes.object.isRequired,
  /**
   * Initial application state.
   */
  initialState: PropTypes.object,
  /**
   * Application locale.
   */
  locale: PropTypes.shape({
    locale: PropTypes.string.isRequired,
    messages: PropTypes.object.isRequired,
  }).isRequired,
  /**
   * Visual theme.
   */
  theme: PropTypes.object.isRequired,
  /**
   * Components that use JusticeAI application API.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default JusticeAIProvider;
