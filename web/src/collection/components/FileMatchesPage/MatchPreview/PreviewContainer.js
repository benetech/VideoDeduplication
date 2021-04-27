import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import BasicContainer from "./BasicContainer";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
});

function PreviewContainer(props) {
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

PreviewContainer.propTypes = {
  /**
   * Preview elements.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default PreviewContainer;
