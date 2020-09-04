import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
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

function Backdrop(props) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.backdrop, className)} {...other}>
      {children}
    </div>
  );
}

Backdrop.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default Backdrop;
