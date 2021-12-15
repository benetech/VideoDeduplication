import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  paneHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(4),
  },
}));

type PaneHeaderProps = {
  children?: React.ReactNode;
  className?: string;
};

function PaneHeader(props: PaneHeaderProps): JSX.Element {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.paneHeader, className)} {...other}>
      {children}
    </div>
  );
}

export default PaneHeader;
