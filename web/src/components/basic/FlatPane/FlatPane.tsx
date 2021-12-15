import React, { HTMLAttributes } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  flatPane: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.common.white,
  },
}));

type FlatPaneProps = HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  className?: string;
};

function FlatPane(props: FlatPaneProps): JSX.Element {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.flatPane, className)} {...other}>
      {children}
    </div>
  );
}

export default FlatPane;
