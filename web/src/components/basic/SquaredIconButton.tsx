import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { ButtonProps } from "@material-ui/core/Button/Button";

const useStyles = makeStyles<Theme>(() => ({
  squaredIconButton: {
    width: 40,
    height: 40,
    minWidth: 40,
    padding: 0,
    boxShadow: "none",
  },
}));
const SquaredIconButton = React.forwardRef(function SquaredIconButton(
  props: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <Button
      className={clsx(classes.squaredIconButton, className)}
      {...other}
      ref={ref}
    >
      {children}
    </Button>
  );
});

export default SquaredIconButton;
