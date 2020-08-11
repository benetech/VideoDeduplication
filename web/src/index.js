import React from "react";
import ReactDOM from "react-dom";
import "regenerator-runtime/runtime.js";
import defaultTheme from "./theme";
import Application from "./application/components/Application/Application";
import Server from "./server-api/Server/Server";
import { detectLocale } from "./i18n/locale";

const server = new Server();
const locale = detectLocale();

function renderApplication(locale) {
  ReactDOM.render(
    <Application server={server} theme={defaultTheme} locale={locale} />,
    document.querySelector("#root")
  );
}

locale.load().then(renderApplication).catch(console.error);
