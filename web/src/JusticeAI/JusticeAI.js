import React from "react";
import PropTypes from "prop-types";
import JusticeAIProvider from "./JusticeAIProvider";
import JusticeAIRootComponent from "./JusticeAIRootComponent";

function JusticeAI(props) {
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

JusticeAI.propTypes = {
  /**
   * Server API.
   */
  server: PropTypes.object.isRequired,
  /**
   * Initial application state.
   */
  initialState: PropTypes.object,
  /**
   * Application locale.
   */
  locale: PropTypes.shape({
    locale: PropTypes.string.isRequired,
    messages: PropTypes.object.isRequired,
  }).isRequired,
  /**
   * Visual theme.
   */
  theme: PropTypes.object.isRequired,
};

export default JusticeAI;
