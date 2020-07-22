import React from "react";
import "fontsource-roboto";
import PropTypes from "prop-types";
import CssBaseline from "@material-ui/core/CssBaseline";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import ApplicationLayout from "./ApplicationLayout";
import CustomScrollbar from "../CustomScrollbar";

/**
 * Application root component.
 */
function Application(props) {
  const { theme, className } = props;
  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <CustomScrollbar>
          <ApplicationLayout className={className} />
        </CustomScrollbar>
      </ThemeProvider>
    </React.Fragment>
  );
}

Application.propTypes = {
  theme: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default Application;
