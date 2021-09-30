import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

const useStyles = makeStyles<Theme>(() => ({
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

function ButtonPicker(props: ButtonPickerProps): JSX.Element {
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
            key={option.title}
          >
            {option.title}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}

type Option = {
  title: string;
  value: any;
};

type ButtonPickerProps = {
  selected?: string;
  onChange: (value: any) => void;
  options: Option[];
  className?: string;
};
export default ButtonPicker;
