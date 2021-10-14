import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  title: {
    ...theme.mixins.title0,
    marginRight: theme.spacing(5),
    flexShrink: 0,
  },
  grow: {
    flexGrow: 1,
  },
}));

function Title(props: TitleProps): JSX.Element {
  const { text, children, grow = false, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.header, className)} {...other}>
      <div className={clsx(classes.title, grow && classes.grow)}>{text}</div>
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
  className?: string;
};
export default Title;
