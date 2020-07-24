import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  links: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
}));

function HeaderLinks(props) {
  const { children: links, className } = props;
  const classes = useStyles();
  return <div className={clsx(classes.links, className)}>{links}</div>;
}

HeaderLinks.propTypes = {
  /**
   * Header links.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
};

export default HeaderLinks;
