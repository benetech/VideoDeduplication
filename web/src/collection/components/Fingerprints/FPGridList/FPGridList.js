import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles((theme) => ({
  gridList: {},
}));

function FpGridList(props) {
  const { children, className } = props;
  const classes = useStyles();
  return (
    <Grid container spacing={1} className={clsx(classes.gridList, className)}>
      {children}
    </Grid>
  );
}

FpGridList.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default FpGridList;
