import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  spacer: {
    flexGrow: ({ grow }) => grow,
  },
});

function Spacer(props) {
  const { grow = 1, className, ...other } = props;
  const classes = useStyles({ grow });
  return <div className={clsx(classes.spacer, className)} {...other} />;
}

Spacer.propTypes = {
  grow: PropTypes.number,
  className: PropTypes.string,
};

export default Spacer;
