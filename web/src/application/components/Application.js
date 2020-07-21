import React from "react";
import clsx from "clsx";
import "fontsource-roboto";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import ThemeProvider from "@material-ui/styles/ThemeProvider";

const useStyles = makeStyles(() => ({
  root: {},
}));

/**
 * Application root component.
 */
function Application(props) {
  const { theme, className } = props;
  const classes = useStyles();
  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <div className={clsx(classes.root, className)}>Hello Winnow</div>
      </ThemeProvider>
    </React.Fragment>
  );
}

Application.propTypes = {
  theme: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default Application;
