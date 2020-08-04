import React from "react";
import ReactDOM from "react-dom";
import "regenerator-runtime/runtime.js";
import defaultTheme from "./theme";
import Application from "./application/components/Application/Application";
import locale from "./i18n/en-US.json";
import Server from "./server-api/Server/Server";

const server = new Server();

ReactDOM.render(
  <Application server={server} theme={defaultTheme} locale={locale} />,
  document.querySelector("#root")
);
