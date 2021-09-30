import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  captionContainer: {
    color: theme.palette.common.white,
    padding: theme.spacing(1),
  },
  backdrop: {
    borderRadius: theme.spacing(0.5),
    backgroundColor: "rgba(5,5,5,0.4)",
  },
}));

function PreviewCaption(props: PreviewCaptionProps): JSX.Element | null {
  const { children, backdrop, className } = props;
  const classes = useStyles(); // Hide caption if content is absent

  if (!children) {
    return null;
  }

  return (
    <div
      className={clsx(
        classes.captionContainer,
        backdrop && classes.backdrop,
        className
      )}
    >
      {children}
    </div>
  );
}

type PreviewCaptionProps = {
  /**
   * Caption content
   */
  children?: React.ReactNode;

  /**
   * Display caption backdrop
   */
  backdrop?: boolean;
  className?: string;
};
export default PreviewCaption;
