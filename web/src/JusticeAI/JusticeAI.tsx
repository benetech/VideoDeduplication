import React from "react";
import JusticeAIProvider from "./JusticeAIProvider";
import JusticeAIRootComponent from "./JusticeAIRootComponent";
import { LocaleData } from "../i18n/locale";
import { AppState } from "../application/state/root/initialState";
import { ServerAPI } from "../server-api/ServerAPI";
import { Theme } from "@material-ui/core";

type JusticeAIProps = {
  server: ServerAPI;
  initialState?: AppState;
  locale: LocaleData;
  theme: Theme;
};

export default function JusticeAI(props: JusticeAIProps): JSX.Element {
  const { server, initialState, locale, theme, ...other } = props;
  return (
    <JusticeAIProvider
      server={server}
      locale={locale}
      theme={theme}
      initialState={initialState}
    >
      <JusticeAIRootComponent {...other} />
    </JusticeAIProvider>
  );
}
