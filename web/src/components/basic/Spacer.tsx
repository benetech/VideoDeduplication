import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme, SpacerProps>({
  spacer: {
    flexGrow: ({ grow }) => grow,
  },
});

function Spacer(props: SpacerProps): JSX.Element {
  const { grow = 1, className, ...other } = props;
  const classes = useStyles({
    grow,
  });
  return <div className={clsx(classes.spacer, className)} {...other} />;
}

type SpacerProps = {
  grow?: number;
  className?: string;
};
export default Spacer;
