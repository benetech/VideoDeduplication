import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { Grid } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(() => ({
  button: {
    height: 23,
    padding: 0,
  },
}));

function GridButtonPickerOption(props) {
  const { title, value, selected, onSelect, className, ...other } = props;
  const classes = useStyles();

  const handleClick = useCallback(() => onSelect(value), [value, onSelect]);

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

GridButtonPickerOption.propTypes = {
  /**
   * Displayed option title
   */
  title: PropTypes.string.isRequired,
  /**
   * Option value
   */
  value: PropTypes.any.isRequired,
  /**
   * True iff the value is selected
   */
  selected: PropTypes.bool,
  /**
   * Fires when value is selected
   */
  onSelect: PropTypes.func,
  className: PropTypes.string,
};

export default GridButtonPickerOption;
