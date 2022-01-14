import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import InfoButton from "../../basic/InfoButton";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    marginBottom: theme.spacing(4),
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  title: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    marginRight: theme.spacing(2),
  },
}));
/**
 * Common layout for individual task attribute inputs.
 */

function InputContainer(props: InputContainerProps): JSX.Element {
  const { title, tooltip, children, className, ...other } = props;
  const classes = useStyles();
  let info: JSX.Element | null = null;

  if (tooltip) {
    info = <InfoButton text={tooltip} />;
  }

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{title}</div>
        {info}
      </div>
      <div>{children}</div>
    </div>
  );
}

type InputContainerProps = {
  /**
   * Task param title.
   */
  title: string;

  /**
   * Optional param tooltip
   */
  tooltip?: string;

  /**
   * Enveloped input components.
   */
  children?: React.ReactNode;
  className?: string;
};
export default InputContainer;
