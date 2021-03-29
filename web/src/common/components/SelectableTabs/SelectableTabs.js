import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(() => ({
  tabs: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
}));

/**
 * Set the following properties: selected, onSelect and value (if absent)
 */
function bindProps(currentValue, onChange, size, spacing) {
  return (tab, currentIndex) => {
    if (!React.isValidElement(tab)) {
      return null;
    }

    // Get value identifying the current tab
    const value =
      tab.props.value === undefined ? currentIndex : tab.props.value;

    // Check if the tab is selected
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

function SelectableTabs(props) {
  const {
    children,
    value,
    onChange,
    size = "medium",
    spacing = 0,
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
  );

  // Set required child properties
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

SelectableTabs.propTypes = {
  /**
   * Currently selected tab.
   */
  value: PropTypes.any,
  /**
   * Fires on tab selection
   */
  onChange: PropTypes.func,
  /**
   * Size variants
   */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /**
   * Controls auto-spacing between tabs (0 - disabled).
   */
  spacing: PropTypes.number,
  /**
   * Tab list
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default SelectableTabs;
