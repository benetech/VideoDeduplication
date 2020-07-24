import React from "react";
import ReactDOM from "react-dom";
import defaultTheme from "./theme";
import Application from "./application/components/Application/Application";
import locale from "./i18n/en-US.json";

ReactDOM.render(
  <Application theme={defaultTheme} locale={locale} />,
  document.querySelector("#root")
);
