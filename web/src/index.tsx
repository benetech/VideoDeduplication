import React from "react";
import ReactDOM from "react-dom";
import "regenerator-runtime/runtime.js";
import defaultTheme from "./theme";
import { detectLocale, LocaleData } from "./i18n/locale";
import JusticeAI from "./JusticeAI/JusticeAI";
import Server from "./server-api/v1/Server";
import "@fontsource/roboto";

const server = new Server();
const locale = detectLocale();

function renderApplication(locale: LocaleData) {
  ReactDOM.render(
    <JusticeAI server={server} theme={defaultTheme} locale={locale} />,
    document.querySelector("#root")
  );
}

locale.load().then(renderApplication).catch(console.error);
