import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  title1: {
    ...theme.mixins.title1,
  },
  title2: {
    ...theme.mixins.title2,
  },
  title3: {
    ...theme.mixins.title3,
  },
  navlink: {
    ...theme.mixins.navlink,
  },
  colorPrimary: {
    color: theme.palette.primary.main,
  },
  colorBlack: {
    color: theme.palette.common.black,
  },
  colorInherit: {
    color: "inherit",
  },
  colorInactive: {
    color: theme.palette.action.textInactive,
  },
  bold: {
    fontWeight: "bold",
  },
}));

/**
 * Emphasized piece of text.
 */
function Label(props) {
  const {
    children: text,
    variant,
    color = "black",
    bold = true,
    className,
  } = props;

  const classes = useStyles();

  return (
    <div
      className={clsx(
        {
          [classes.title1]: variant === "title1",
          [classes.title2]: variant === "title2",
          [classes.title3]: variant === "title3",
          [classes.navlink]: variant === "navlink",
        },
        {
          [classes.colorPrimary]: color === "primary",
          [classes.colorBlack]: color === "black",
          [classes.colorInherit]: color === "inherit",
          [classes.colorInactive]: color === "inactive",
        },
        {
          [classes.bold]: bold,
        },
        className
      )}
    >
      {text}
    </div>
  );
}

Label.propTypes = {
  color: PropTypes.oneOf(["inherit", "black", "primary", "inactive"]),
  variant: PropTypes.oneOf(["title1", "title2", "title3", "navlink"])
    .isRequired,
  bold: PropTypes.bool,
  children: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Label;
