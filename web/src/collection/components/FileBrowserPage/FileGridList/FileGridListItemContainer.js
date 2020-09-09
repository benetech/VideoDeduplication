import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { composition } from "./composition";

const useStyles = makeStyles({
  itemContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    "&:focus": {
      outline: "none",
      boxShadow: "0 12px 18px 0 rgba(0,0,0,0.28)",
    },
  },
});

function FileGridListItemContainer(props) {
  const { children, dense = false, className, ...other } = props;
  const decrease = dense ? 1 : 0;
  const classes = useStyles();

  return (
    <Grid
      item
      xs={12 / Math.max(composition.xs - decrease, 1)}
      sm={12 / Math.max(composition.sm - decrease, 1)}
      md={12 / Math.max(composition.md - decrease, 1)}
      lg={12 / Math.max(composition.lg - decrease, 1)}
      xl={12 / Math.max(composition.xl - decrease, 1)}
    >
      <Paper className={clsx(classes.itemContainer, className)} {...other}>
        {children}
      </Paper>
    </Grid>
  );
}

FileGridListItemContainer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  dense: PropTypes.bool,
  className: PropTypes.string,
};

export default FileGridListItemContainer;
