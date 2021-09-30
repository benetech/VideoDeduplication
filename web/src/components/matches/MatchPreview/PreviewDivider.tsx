import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>({
  divider: {
    borderTop: "1px solid #F5F5F5",
  },
  dark: {
    borderTop: "1px solid #B7B7B7",
  },
});

function PreviewDivider(props: PreviewDividerProps): JSX.Element {
  const { dark = false, className, ...other } = props;
  const classes = useStyles();
  return (
    <div
      className={clsx(classes.divider, dark && classes.dark, className)}
      {...other}
    />
  );
}

type PreviewDividerProps = {
  /**
   * Enable dark variant.
   */
  dark?: boolean;
  className?: string;
};
export default PreviewDivider;
