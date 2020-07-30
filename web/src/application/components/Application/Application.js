import React from "react";
import "fontsource-roboto";
import "lato-font";
import PropTypes from "prop-types";
import CssBaseline from "@material-ui/core/CssBaseline";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import ApplicationLayout from "./ApplicationLayout";
import CustomScrollbar from "../CustomScrollbar";
import { IntlProvider } from "react-intl";

/**
 * Application root component.
 */
function Application(props) {
  const { locale, theme, className } = props;
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
            <ApplicationLayout className={className} />
          </IntlProvider>
        </CustomScrollbar>
      </ThemeProvider>
    </React.Fragment>
  );
}

Application.propTypes = {
  locale: PropTypes.shape({
    locale: PropTypes.string.isRequired,
    messages: PropTypes.object.isRequired,
  }).isRequired,
  theme: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default Application;
