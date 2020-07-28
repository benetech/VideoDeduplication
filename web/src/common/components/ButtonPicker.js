import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

const useStyles = makeStyles((theme) => ({
  button: {
    textTransform: "none",
  },
}));

function color(value, selected) {
  if (value === selected) {
    return "primary";
  }
  return "default";
}

function ButtonPicker(props) {
  const { selected, options, onChange, className } = props;
  const classes = useStyles();

  return (
    <div className={clsx(className)}>
      <ButtonGroup className={classes.buttonGroup}>
        {options.map((option) => (
          <Button
            variant="outlined"
            color={color(option.value, selected)}
            className={classes.button}
            onClick={() => onChange(option.value)}
          >
            {option.title}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}

ButtonPicker.propTypes = {
  selected: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
    })
  ).isRequired,
  className: PropTypes.string,
};

export default ButtonPicker;
