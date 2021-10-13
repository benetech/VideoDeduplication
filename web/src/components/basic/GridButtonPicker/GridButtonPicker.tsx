import React, { useCallback } from "react";
import clsx from "clsx";
import { Grid } from "@material-ui/core";
import GridButtonPickerOption from "./GridButtonPickerOption";
import { GridProps } from "@material-ui/core/Grid/Grid";

/**
 * Set the following properties: selected, onSelect
 */
function bindProps<T>(
  selectedValues: T[],
  onSelect: (selected: T[]) => void
): (option: React.ReactNode) => React.ReactNode {
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

function GridButtonPicker<T = any>(
  props: GridButtonPickerProps<T>
): JSX.Element {
  const { selected, onChange, children, className, ...other } = props;

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
    <Grid
      container
      spacing={1}
      className={clsx(className)}
      role="listbox"
      {...other}
    >
      {options}
    </Grid>
  );
}

type GridButtonPickerProps<T> = GridProps & {
  /**
   * Selected values
   */
  selected: T[];
  /**
   * Fire when selection changes
   */
  onChange: (selected: T[]) => void;
};

// Access option type from picker type
GridButtonPicker.Option = GridButtonPickerOption;

export default GridButtonPicker;
