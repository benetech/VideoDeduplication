import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  spacer: {
    height: theme.spacing(4),
    width: theme.spacing(6),
  },
}));

function Spacer(props) {
  const { className, ...other } = props;
  const classes = useStyles();
  return <div className={clsx(classes.spacer, className)} {...other} />;
}

Spacer.propTypes = {
  className: PropTypes.string,
};

export default Spacer;
