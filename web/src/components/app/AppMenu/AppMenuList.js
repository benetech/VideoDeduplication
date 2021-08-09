import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
}));

/**
 * List of items displayed in application left-side menu.
 */
function AppMenuList(props) {
  const { children, className } = props;
  const classes = useStyles();
  return <div className={clsx(classes.root, className)}>{children}</div>;
}

AppMenuList.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
};

export default AppMenuList;
