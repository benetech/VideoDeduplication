import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  title: {
    fontFamily: "Roboto",
  },
  title1: {
    fontSize: 43,
    letterSpacing: 0,
    fontWeight: "bold",
  },
  title2: {
    fontSize: 30,
    letterSpacing: 0,
    fontWeight: "bold",
  },
  title3: {
    fontSize: 20,
    letterSpacing: 0,
    fontWeight: "bold",
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
    fontWeight: "normal",
  },
}));

/**
 * Emphasized piece of text.
 */
function Label(props) {
  const { children: text, role, color = "default", className } = props;
  const classes = useStyles();
  return (
    <div
      className={clsx(
        classes.title,
        {
          [classes.title1]: role === "title1",
          [classes.title2]: role === "title2",
          [classes.title3]: role === "title3",
        },
        {
          [classes.colorPrimary]: color === "primary",
          [classes.colorBlack]: color === "black",
          [classes.colorInherit]: color === "inherit",
          [classes.colorInactive]: color === "inactive",
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
  role: PropTypes.oneOf(["title1", "title2", "title3", "title4"]).isRequired,
  children: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Label;
