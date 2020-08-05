import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(() => ({
  button: {
    width: 35,
    height: 35,
    minWidth: "min-content",
    padding: 0,
  },
}));

function PlusButton(props) {
  const { onClick, className } = props;
  const classes = useStyles();
  return (
    <Button
      onClick={onClick}
      color="primary"
      variant="contained"
      component="div"
      className={clsx(classes.button, className)}
    >
      +
    </Button>
  );
}

PlusButton.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default PlusButton;
