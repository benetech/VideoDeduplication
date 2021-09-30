import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import MuiButton from "@material-ui/core/Button";
import { ButtonProps } from "@material-ui/core/Button/Button";

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
const ButtonComponent = React.forwardRef(function Button(
  props: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const { className, ...otherProps } = props;
  const classes = useStyles();
  return (
    <MuiButton
      {...otherProps}
      ref={ref}
      className={clsx(classes.button, className)}
    />
  );
});

export default ButtonComponent;
