import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import BasicContainer from "./BasicContainer";

const useStyles = makeStyles<Theme>({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
});

function PreviewContainer(props: PreviewContainerProps): JSX.Element {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <BasicContainer
      className={clsx(classes.root, className)}
      tabIndex={0}
      {...other}
    >
      {children}
    </BasicContainer>
  );
}

type PreviewContainerProps = {
  /**
   * Preview elements.
   */
  children?: React.ReactNode;
  className?: string;
};
export default PreviewContainer;
