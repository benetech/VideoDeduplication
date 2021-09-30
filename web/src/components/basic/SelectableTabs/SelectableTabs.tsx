import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>(() => ({
  tabs: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "min-content",
  },
}));
/**
 * Set the following properties: selected, onSelect and value (if absent)
 */

function bindProps(
  currentValue: any,
  onChange: (value: any) => void,
  size: "small" | "medium" | "large",
  spacing: number
): (tab: React.ReactNode) => React.ReactNode {
  let currentIndex = -1;
  return (tab) => {
    if (!React.isValidElement(tab)) {
      return null;
    } // Increment current index

    currentIndex += 1; // Get value identifying the current tab

    const value =
      tab.props.value === undefined ? currentIndex : tab.props.value; // Check if the tab is selected

    const selected = value === currentValue;
    return React.cloneElement(tab, {
      size,
      spacing,
      ...tab.props,
      selected,
      onSelect: onChange,
      value,
      first: currentIndex === 0,
    });
  };
}

function SelectableTabs(props: SelectableTabsProps): JSX.Element {
  const {
    children,
    value,
    onChange,
    size = "medium",
    spacing = 1,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const handleChange = useCallback(
    (newValue) => {
      if (onChange && newValue !== value) {
        onChange(newValue);
      }
    },
    [value, onChange]
  ); // Set required child properties

  const tabs = React.Children.map(
    children,
    bindProps(value, handleChange, size, spacing)
  );
  return (
    <div className={clsx(classes.tabs, className)} {...other} role="tablist">
      {tabs}
    </div>
  );
}

type SelectableTabsProps = {
  /**
   * Currently selected tab.
   */
  value?: any;

  /**
   * Fires on tab selection
   */
  onChange?: (value: any) => void;

  /**
   * Size variants
   */
  size?: "small" | "medium" | "large";

  /**
   * Controls auto-spacing between tabs (0 - disabled).
   */
  spacing?: number;

  /**
   * Tab list
   */
  children?: React.ReactNode;
  className?: string;
};
export default SelectableTabs;
