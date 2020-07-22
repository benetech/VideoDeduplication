import React from "react";
import ReactDOM from "react-dom";
import defaultTheme from "./theme";
import Application from "./application/components/Application/Application";

ReactDOM.render(
  <Application theme={defaultTheme} />,
  document.querySelector("#root")
);
