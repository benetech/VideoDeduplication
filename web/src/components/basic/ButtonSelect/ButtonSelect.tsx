import React from "react";
import clsx from "clsx";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { ClassNameMap, makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ButtonSelectOption from "./ButtonSelectOption";

const useStyles = makeStyles<Theme>(() => ({
  option: {
    textTransform: "none",
  },
  beforeSelected: {
    borderRightColor: "transparent",
    "&:hover": {
      borderRightColor: "transparent",
    },
  },
  afterSelected: {
    borderLeftColor: "transparent",
    "&:hover": {
      borderLeftColor: "transparent",
    },
  },
}));

/**
 * Get value associated with the option element
 */
function getValue(option: React.ReactElement, index: number): any {
  return option.props.value === undefined ? index : option.props.value;
}

/**
 * Set the following properties: selected, onSelect and value (if absent)
 */
function bindProperties<T = any>(
  selectedValue: T | undefined,
  onChange: ((value: T) => void) | undefined,
  selectedIndex: number | undefined,
  classes: ClassNameMap
): (option: React.ReactNode) => React.ReactNode | null {
  let currentIndex = 0;
  return (option) => {
    if (!React.isValidElement(option)) {
      return null;
    }

    // Get value identifying the current option
    const optionValue = getValue(option, currentIndex);

    // Check if the option is selected
    const selected = optionValue === selectedValue;

    // Get additional option styles
    const optionClass = getStyles(currentIndex, selectedIndex, classes);
    currentIndex += 1;

    return React.cloneElement(option, {
      selected,
      onSelect: onChange,
      value: optionValue,
      className: optionClass,
    });
  };
}

/**
 * Get index of selected value
 */
function selectionIndex<T>(
  children: React.ReactNode,
  selectedValue: T | undefined
): number | undefined {
  let selectedIndex: number | undefined = undefined;
  React.Children.forEach(children, (element, index) => {
    if (
      React.isValidElement(element) &&
      getValue(element, index) === selectedValue
    ) {
      selectedIndex = index;
    }
  });
  return selectedIndex;
}

/**
 * Get option element style depending on position
 * relative to the selected element
 */
function getStyles(
  currentIndex: number,
  selectedIndex: number | undefined,
  classes: ClassNameMap
): string {
  const beforeSelected = currentIndex + 1 === selectedIndex;
  const afterSelected = currentIndex - 1 === selectedIndex;
  return clsx(
    classes.option,
    beforeSelected && classes.beforeSelected,
    afterSelected && classes.afterSelected
  );
}

function ButtonSelect<T = any>(props: ButtonSelectProps<T>): JSX.Element {
  const { value, onChange, children, className, ...other } = props;
  const classes = useStyles();

  // Find selected value index
  const selectedIndex = selectionIndex(children, value);

  // Set required child properties
  const options = React.Children.map(
    children,
    bindProperties(value, onChange, selectedIndex, classes)
  );

  return (
    <ButtonGroup className={clsx(className)} role="listbox" {...other}>
      {options}
    </ButtonGroup>
  );
}

type ButtonSelectProps<T = any> = {
  /**
   * Currently chosen value.
   */
  value?: T;

  /**
   * Fires on new value selection
   */
  onChange?: (value: T) => void;

  /**
   * Option list
   */
  children?: React.ReactNode;
  className?: string;
};

// Quick option type access
ButtonSelect.Option = ButtonSelectOption;

export default ButtonSelect;
