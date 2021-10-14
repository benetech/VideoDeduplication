import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  divider: {
    borderLeftStyle: "solid",
    borderLeftColor: theme.palette.border.light,
    borderLeftWidth: 1,
    height: theme.spacing(4),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
  },
}));

function Divider(props: DividerProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  return <div className={clsx(classes.divider, className)} {...other} />;
}

type DividerProps = {
  className?: string;
};
export default Divider;
