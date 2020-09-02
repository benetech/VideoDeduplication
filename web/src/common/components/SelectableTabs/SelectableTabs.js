import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  tabs: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
}));

/**
 * Set the following properties: selected, onSelect and value (if absent)
 */
function bindProps(currentValue, onChange) {
  let currentIndex = 0;
  return (tab) => {
    if (!React.isValidElement(tab)) {
      return null;
    }

    // Get value identifying the current tab
    const value =
      tab.props.value === undefined ? currentIndex : tab.props.value;

    // Check if the tab is selected
    const selected = value === currentValue;

    currentIndex += 1;
    return React.cloneElement(tab, {
      selected,
      onSelect: onChange,
      value,
    });
  };
}

function SelectableTabs(props) {
  const { children, value, onChange, className } = props;
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
  const tabs = React.Children.map(children, bindProps(value, handleChange));

  return <div className={clsx(classes.tabs, className)}>{tabs}</div>;
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
   * Tab list
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default SelectableTabs;
