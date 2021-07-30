import React from "react";
import ReactDOM from "react-dom";
import "regenerator-runtime/runtime.js";
import defaultTheme from "./theme";
import Server from "./server-api/Server/Server";
import { detectLocale } from "./i18n/locale";
import JusticeAI from "./JusticeAI/JusticeAI";

const server = new Server();
const locale = detectLocale();

function renderApplication(locale) {
  ReactDOM.render(
    <JusticeAI server={server} theme={defaultTheme} locale={locale} />,
    document.querySelector("#root")
  );
}

locale.load().then(renderApplication).catch(console.error);
