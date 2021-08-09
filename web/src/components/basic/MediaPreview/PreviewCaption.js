import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  captionContainer: {
    color: theme.palette.common.white,
    padding: theme.spacing(1),
  },
  backdrop: {
    borderRadius: theme.spacing(0.5),
    backgroundColor: "rgba(5,5,5,0.4)",
  },
}));

function PreviewCaption(props) {
  const { children, backdrop, className } = props;
  const classes = useStyles();

  // Hide caption if content is absent
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

PreviewCaption.propTypes = {
  /**
   * Caption content
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  /**
   * Display caption backdrop
   */
  backdrop: PropTypes.bool,
  className: PropTypes.string,
};

export default PreviewCaption;
