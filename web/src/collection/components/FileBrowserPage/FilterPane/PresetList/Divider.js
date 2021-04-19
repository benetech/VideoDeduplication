import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { Divider as MuiDivider } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  divider: {
    backgroundColor: theme.palette.dividerLight,
  },
}));

function Divider(props) {
  const { className, ...other } = props;
  const classes = useStyles();

  return (
    <MuiDivider
      className={clsx(classes.divider, className)}
      component="li"
      {...other}
    />
  );
}

Divider.propTypes = {
  className: PropTypes.string,
};

export default Divider;
