import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(() => ({
  squaredIconButton: {
    width: 40,
    height: 40,
    minWidth: 40,
    padding: 0,
    boxShadow: "none",
  },
}));

const SquaredIconButton = React.forwardRef(function SquaredIconButton(
  props,
  ref
) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <Button
      component="div"
      className={clsx(classes.squaredIconButton, className)}
      {...other}
      ref={ref}
    >
      {children}
    </Button>
  );
});

/**
 * SquaredIconButton is a wrapper around Material-UI Button Component.
 * Below are MUI Button's property types:
 */
SquaredIconButton.propTypes = {
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

export default SquaredIconButton;
