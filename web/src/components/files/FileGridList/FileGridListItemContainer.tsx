import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { GridSize, Theme } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { PaperProps } from "@material-ui/core/Paper/Paper";

const useStyles = makeStyles<Theme>({
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

function FileGridListItemContainer(
  props: FileGridListItemContainerProps
): JSX.Element {
  const { children, perRow, className, ...other } = props;
  const classes = useStyles();
  return (
    <Grid item xs={Math.ceil(12 / Math.max(perRow, 1)) as GridSize}>
      <Paper className={clsx(classes.itemContainer, className)} {...other}>
        {children}
      </Paper>
    </Grid>
  );
}

type FileGridListItemContainerProps = PaperProps & {
  /**
   * How many items will be displayed per row.
   */
  perRow: number;
  children?: React.ReactNode;
  className?: string;
};
export default FileGridListItemContainer;
