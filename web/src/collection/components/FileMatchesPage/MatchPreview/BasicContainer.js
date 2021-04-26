import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles({
  root: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    "&:focus": {
      outline: "none",
      boxShadow: "0 12px 18px 0 rgba(0,0,0,0.28)",
    },
  },
});

function BasicContainer(props) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <Paper className={clsx(classes.root, className)} {...other}>
      {children}
    </Paper>
  );
}

BasicContainer.propTypes = {
  /**
   * Preview content.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default BasicContainer;
