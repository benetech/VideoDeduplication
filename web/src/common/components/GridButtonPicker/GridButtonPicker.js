import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { Grid } from "@material-ui/core";
import GridButtonPickerOption from "./GridButtonPickerOption";

const useStyles = makeStyles((theme) => ({}));

/**
 * Set the following properties: selected, onSelect
 */
function bindProps(selectedValues, onSelect) {
  return (option) => {
    if (!React.isValidElement(option)) {
      return null;
    }

    // Get option value
    const value = option.props.value;
    // Check if the option is selected
    const selected = selectedValues.includes(value);

    return React.cloneElement(option, {
      selected,
      onSelect,
    });
  };
}

function GridButtonPicker(props) {
  const { selected, onChange, children, className } = props;

  // Invert value presence on selection
  const handleSelect = useCallback(
    (value) => {
      if (selected.includes(value)) {
        onChange(selected.filter((item) => item !== value));
      } else {
        onChange([...selected, value]);
      }
    },
    [selected, onChange]
  );

  // set `select` and `onSelect` props
  const options = React.Children.map(
    children,
    bindProps(selected, handleSelect)
  );

  return (
    <Grid container spacing={1} className={clsx(className)}>
      {options}
    </Grid>
  );
}

GridButtonPicker.propTypes = {
  /**
   * Selected values
   */
  selected: PropTypes.array.isRequired,
  /**
   * Fire when selection changes
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Options to select
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

// Access option type from picker type
GridButtonPicker.Option = GridButtonPickerOption;

export default GridButtonPicker;
