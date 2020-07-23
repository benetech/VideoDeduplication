import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  decorator: {
    zIndex: 5,
    position: "absolute",
    backgroundColor: theme.palette.primary.main,
  },
  top: {
    top: 0,
    width: "50%",
    height: theme.dimensions.selectionDecorator.size,
  },
  bottom: {
    bottom: 0,
    width: "50%",
    height: theme.dimensions.selectionDecorator.size,
  },
  left: {
    left: 0,
    height: "50%",
    width: theme.dimensions.selectionDecorator.size,
  },
  right: {
    right: 0,
    height: "50%",
    width: theme.dimensions.selectionDecorator.size,
  },
}));

/**
 * Overlay displayed when item is selected.
 */
function SelectionDecorator(props) {
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

SelectionDecorator.propTypes = {
  /**
   * Determines where the decorator will be displayed.
   */
  variant: PropTypes.oneOf(["top", "bottom", "left", "right"]),
  className: PropTypes.string,
};

export default SelectionDecorator;