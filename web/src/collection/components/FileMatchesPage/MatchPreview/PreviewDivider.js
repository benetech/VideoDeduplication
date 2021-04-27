import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  divider: {
    borderTop: "1px solid #F5F5F5",
  },
  dark: {
    borderTop: "1px solid #B7B7B7",
  },
});

function PreviewDivider(props) {
  const { dark = false, className, ...other } = props;
  const classes = useStyles();
  return (
    <div
      className={clsx(classes.divider, dark && classes.dark, className)}
      {...other}
    />
  );
}

PreviewDivider.propTypes = {
  /**
   * Enable dark variant.
   */
  dark: PropTypes.bool,
  className: PropTypes.string,
};

export default PreviewDivider;
