import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  divider: {
    borderLeftStyle: "solid",
    borderLeftColor: theme.palette.border.light,
    borderLeftWidth: 1,
    height: theme.spacing(4),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
  },
}));

function Divider(props) {
  const { className, ...other } = props;
  const classes = useStyles();
  return <div className={clsx(classes.divider, classes.divider)} {...other} />;
}

Divider.propTypes = {
  className: PropTypes.string,
};

export default Divider;
