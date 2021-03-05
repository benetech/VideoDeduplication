import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  divider: {
    borderTop: "1px solid #F5F5F5",
  },
});

function PreviewDivider(props) {
  const { className, ...other } = props;
  const classes = useStyles();
  return <div className={clsx(classes.divider, className)} {...other} />;
}

PreviewDivider.propTypes = {
  className: PropTypes.string,
};

export default PreviewDivider;
