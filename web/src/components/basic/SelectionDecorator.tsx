import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  decorator: {
    zIndex: 5,
    position: "absolute",
    backgroundColor: theme.palette.primary.main,
  },
  top: {
    top: 0,
    width: "100%",
    height: theme.dimensions.selectionDecorator.horizontalSize,
  },
  bottom: {
    bottom: 0,
    left: 0,
    width: "100%",
    height: theme.dimensions.selectionDecorator.horizontalSize,
  },
  left: {
    left: 0,
    height: "100%",
    width: theme.dimensions.selectionDecorator.verticalSize,
  },
  right: {
    right: 0,
    height: "100%",
    width: theme.dimensions.selectionDecorator.verticalSize,
  },
}));
/**
 * Overlay displayed when item is selected.
 */

function SelectionDecorator(props: SelectionDecoratorProps): JSX.Element {
  const { variant = "bottom", className } = props;
  const classes = useStyles();
  return (
    <div
      className={clsx(
        classes.decorator,
        {
          [classes.top]: variant === "top",
          [classes.bottom]: variant === "bottom",
          [classes.left]: variant === "left",
          [classes.right]: variant === "right",
        },
        className
      )}
    />
  );
}

type SelectionDecoratorProps = {
  /**
   * Determines where the decorator will be displayed.
   */
  variant?: "top" | "bottom" | "left" | "right";
  className?: string;
};
export default SelectionDecorator;
