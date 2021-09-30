import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
}));
/**
 * List of items displayed in application left-side menu.
 */

function AppMenuList(props: AppMenuListProps): JSX.Element {
  const { children, className } = props;
  const classes = useStyles();
  return <div className={clsx(classes.root, className)}>{children}</div>;
}

type AppMenuListProps = {
  children: React.ReactNode;
  className?: string;
};
export default AppMenuList;
