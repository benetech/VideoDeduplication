import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  title1: { ...theme.mixins.title1 },
  title2: { ...theme.mixins.title2 },
  title3: { ...theme.mixins.title3 },
  navlink: { ...theme.mixins.navlink },
  colorPrimary: {
    color: theme.palette.primary.main,
  },
  colorBlack: {
    color: theme.palette.common.black,
  },
  colorInherit: {
    color: "inherit",
  },
  colorInactive: {
    color: theme.palette.action.textInactive,
  },
  bold: {
    fontWeight: "bold",
  },
}));
/**
 * Emphasized piece of text.
 */

function Label(props: LabelProps): JSX.Element {
  const {
    children: text,
    variant,
    color = "black",
    bold = true,
    className,
    ...other
  } = props;
  const classes = useStyles();
  return (
    <div
      className={clsx(
        {
          [classes.title1]: variant === "title1",
          [classes.title2]: variant === "title2",
          [classes.title3]: variant === "title3",
          [classes.navlink]: variant === "navlink",
        },
        {
          [classes.colorPrimary]: color === "primary",
          [classes.colorBlack]: color === "black",
          [classes.colorInherit]: color === "inherit",
          [classes.colorInactive]: color === "inactive",
        },
        {
          [classes.bold]: bold,
        },
        className
      )}
      {...other}
    >
      {text}
    </div>
  );
}

type LabelProps = React.HTMLProps<HTMLDivElement> & {
  color?: "inherit" | "black" | "primary" | "inactive";
  variant: "title1" | "title2" | "title3" | "navlink";
  bold?: boolean;
  children: string;
  className?: string;
};
export default Label;
