import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import MuiButton from "@material-ui/core/Button";

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
    boxShadow: "none",
    height: 40,
  },
}));

/**
 * Wrapper around MUI Button with appropriate styles.
 */
function Button(props) {
  const { className, ...otherProps } = props;
  const classes = useStyles();
  return (
    <MuiButton {...otherProps} className={clsx(classes.button, className)} />
  );
}

/**
 * Button is a wrapper around MUI Button.
 * These properties are simply passed to the underlying MUI Button component.
 */
Button.propTypes = {
  classes: PropTypes.object,
  color: PropTypes.oneOf(["default", "inherit", "primary", "secondary"]),
  component: PropTypes.elementType,
  disabled: PropTypes.bool,
  disableElevation: PropTypes.bool,
  disableFocusRipple: PropTypes.bool,
  disableRipple: PropTypes.bool,
  endIcon: PropTypes.node,
  focusVisibleClassName: PropTypes.string,
  fullWidth: PropTypes.bool,
  href: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  startIcon: PropTypes.node,
  type: PropTypes.string,
  variant: PropTypes.oneOf(["text", "outlined", "contained"]),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
};

export default Button;
