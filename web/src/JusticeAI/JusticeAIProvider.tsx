import React, { useMemo } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import CustomScrollbar from "../components/app/CustomScrollbar";
import { IntlProvider } from "react-intl";
import { ServerProvider } from "../server-api/context";
import { Provider as StoreProvider } from "react-redux";
import makeStore from "./helpers/makeStore";
import { QueryClient, QueryClientProvider } from "react-query";
import HandleSocketEvents from "./HandleSocketEvents";
import { ServerAPI } from "../server-api/ServerAPI";
import { AppState } from "../application/state/root/initialState";
import { LocaleData } from "../i18n/locale";
import { Theme } from "@material-ui/core";

type JusticeAIProviderProps = {
  queryClient?: QueryClient;
  server: ServerAPI;
  initialState?: AppState;
  locale: LocaleData;
  theme: Theme;
  children: React.ReactNode;
};

/**
 * JusticeAI application API provider.
 */
export default function JusticeAIProvider(
  props: JusticeAIProviderProps
): JSX.Element {
  const { server, initialState, locale, theme, children } = props;
  const store = useMemo(() => makeStore(initialState), []);
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
