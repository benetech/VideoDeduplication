import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import PlusIcon from "./PlusIcon";

const useStyles = makeStyles<Theme>(() => ({
  pair: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  plus: {
    width: "43.33%",
  },
}));

function PlusPlusIcon(props: PlusPlusIconProps): JSX.Element {
  const { className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.pair, className)}>
      <PlusIcon className={classes.plus} />
      <PlusIcon className={classes.plus} />
    </div>
  );
}

type PlusPlusIconProps = {
  className?: string;
};
export default PlusPlusIcon;
