import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: theme.zIndex.modal,
    backgroundColor: theme.palette.background.backdrop,
  },
}));

function Backdrop(props: BackdropProps): JSX.Element {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.backdrop, className)} {...other}>
      {children}
    </div>
  );
}

type BackdropProps = {
  children?: React.ReactNode;
  className?: string;
};
export default Backdrop;
