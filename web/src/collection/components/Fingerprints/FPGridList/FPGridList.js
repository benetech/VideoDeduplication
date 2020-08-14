import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles, useTheme } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import { composition } from "./composition";

const useStyles = makeStyles((theme) => ({
  gridList: {
    [theme.breakpoints.only("xs")]: {
      minWidth: theme.dimensions.gridItem.width * composition.xs,
    },
    [theme.breakpoints.only("sm")]: {
      minWidth: theme.dimensions.gridItem.width * composition.sm,
    },
    [theme.breakpoints.only("md")]: {
      minWidth: theme.dimensions.gridItem.width * composition.md,
    },
    [theme.breakpoints.only("lg")]: {
      minWidth: theme.dimensions.gridItem.width * composition.lg,
    },
    [theme.breakpoints.up("xl")]: {
      minWidth: theme.dimensions.gridItem.width * composition.xl,
    },
  },
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
