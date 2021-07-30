import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

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
  const { children, perRow, className, ...other } = props;
  const classes = useStyles();

  return (
    <Grid item xs={Math.ceil(12 / perRow)}>
      <Paper className={clsx(classes.itemContainer, className)} {...other}>
        {children}
      </Paper>
    </Grid>
  );
}

FileGridListItemContainer.propTypes = {
  /**
   * How many items will be displayed per row.
   */
  perRow: PropTypes.number.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default FileGridListItemContainer;
