import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { PaperProps } from "@material-ui/core/Paper/Paper";

const useStyles = makeStyles<Theme>({
  root: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    "&:focus": {
      outline: "none",
      boxShadow: "0 12px 18px 0 rgba(0,0,0,0.28)",
    },
  },
});

function BasicContainer(props: BasicContainerProps): JSX.Element {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <Paper className={clsx(classes.root, className)} {...other}>
      {children}
    </Paper>
  );
}

type BasicContainerProps = PaperProps & {
  /**
   * Preview content.
   */
  children?: React.ReactNode;
};
export default BasicContainer;
