import React from "react";
import ReactDOM from "react-dom";
import "regenerator-runtime/runtime.js";
import defaultTheme from "./theme";
import Application from "./application/components/Application/Application";
import Server from "./server-api/Server/Server";
import { loadLocale } from "./i18n/locale";

const server = new Server();

loadLocale()
  .then((locale) => {
    ReactDOM.render(
      <Application server={server} theme={defaultTheme} locale={locale} />,
      document.querySelector("#root")
    );
  })
  .catch((error) => {
    ReactDOM.render(
      <h3>Cannot load locale</h3>,
      document.querySelector("#root")
    );
  });
