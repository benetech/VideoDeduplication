import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  squaredIconButton: {
    width: 40,
    height: 40,
    minWidth: 40,
    padding: 0,
  },
}));

function SquaredIconButton(props) {
  const { children, className, ...other } = props;
  const classes = useStyles();
  return (
    <Button
      component="div"
      className={clsx(classes.squaredIconButton, className)}
      {...other}
    >
      {children}
    </Button>
  );
}

SquaredIconButton.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
};

export default SquaredIconButton;
