import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  spacer: {
    height: theme.spacing(4),
    width: theme.spacing(6),
  },
}));

function Spacer(props: SpacerProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  return <div className={clsx(classes.spacer, className)} {...other} />;
}

type SpacerProps = {
  className?: string;
};
export default Spacer;
