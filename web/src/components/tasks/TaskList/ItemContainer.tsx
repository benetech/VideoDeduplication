import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
    marginBottom: theme.spacing(1),
  },
}));

function ItemContainer(props: ItemContainerProps): JSX.Element {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.container, className)} {...other}>
      {children}
    </div>
  );
}

type ItemContainerProps = {
  /**
   * Container displayed contents.
   */
  children?: React.ReactNode;
  className?: string;
};
export default ItemContainer;
