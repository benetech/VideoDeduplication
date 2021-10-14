import React, { useCallback } from "react";
import clsx from "clsx";
import { Grid, Theme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles<Theme>(() => ({
  button: {
    height: 23,
    padding: 0,
  },
}));

function GridButtonPickerOption<T>(
  props: GridButtonPickerOptionProps<T>
): JSX.Element {
  const { title, value, selected, onSelect, className, ...other } = props;
  const classes = useStyles();
  const handleClick = useCallback(() => {
    if (onSelect != null) {
      onSelect(value);
    }
  }, [value, onSelect]);
  return (
    <Grid item xs={4} className={clsx(className)} {...other}>
      <Button
        size="small"
        onClick={handleClick}
        variant={selected ? "contained" : "outlined"}
        color={selected ? "primary" : "secondary"}
        className={classes.button}
        role="option"
        aria-checked={selected}
      >
        {title}
      </Button>
    </Grid>
  );
}

type GridButtonPickerOptionProps<T> = {
  /**
   * Displayed option title
   */
  title: string;

  /**
   * Option value
   */
  value: T;

  /**
   * True iff the value is selected
   */
  selected?: boolean;

  /**
   * Fires when value is selected
   */
  onSelect?: (value: T) => void;
  className?: string;
};
export default GridButtonPickerOption;
