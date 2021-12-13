import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    ...theme.mixins.title0,
    marginRight: theme.spacing(5),
    flexShrink: 0,
  },
  subtitle: {
    fontWeight: "bold",
    ...theme.mixins.title2,
    marginRight: theme.spacing(3),
    flexShrink: 0,
  },
  grow: {
    flexGrow: 1,
  },
}));

function Title(props: TitleProps): JSX.Element {
  const {
    text,
    children,
    grow = false,
    variant = "title",
    className,
    ...other
  } = props;
  const classes = useStyles();
  const titleClasses = {
    [classes.title]: variant === "title",
    [classes.subtitle]: variant === "subtitle",
  };

  return (
    <div className={clsx(classes.container, className)} {...other}>
      <div className={clsx(titleClasses, grow && classes.grow)}>{text}</div>
      {children}
    </div>
  );
}

type TitleProps = {
  /**
   * Text to be displayed.
   */
  text?: string;

  /**
   * Additional title elements and decorations.
   */
  children?: React.ReactNode;

  /**
   * Control title horizontal stretching.
   */
  grow?: boolean;
  variant?: "title" | "subtitle";
  className?: string;
};
export default Title;
