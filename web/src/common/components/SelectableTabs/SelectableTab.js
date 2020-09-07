import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import SelectionDecorator from "../SelectionDecorator";
import { ButtonBase } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  tab: {
    cursor: "pointer",

    /**
     * Ensure selection decorator is displayed correctly.
     */
    transform: "translate(0%, 0px)",
  },
  sizeLarge: {
    ...theme.mixins.navlinkLarge,
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },
  sizeMedium: {
    ...theme.mixins.navlink,
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },
  sizeSmall: {
    ...theme.mixins.navlinkSmall,
    fontWeight: 500,
    marginBottom: theme.spacing(0.5),
  },
  inactive: {
    color: theme.palette.action.textInactive,
  },
}));

/**
 * Get tab's label CSS class
 */
function labelClass(classes, size, selected) {
  return clsx({
    [classes.sizeMedium]: size === "medium",
    [classes.sizeSmall]: size === "small",
    [classes.sizeLarge]: size === "large",
    [classes.inactive]: !selected,
  });
}

/**
 * Array of selectable tabs
 */
function SelectableTab(props) {
  const {
    label,
    selected,
    onSelect,
    value,
    size = "medium",
    className,
    ...other
  } = props;
  const classes = useStyles();
  const handleSelect = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <ButtonBase
      onClick={handleSelect}
      className={clsx(classes.tab, className)}
      component="div"
      focusRipple
      disableTouchRipple
      role="tab"
      aria-label={label}
      {...other}
    >
      <div className={labelClass(classes, size, selected)}>{label}</div>
      {selected && <SelectionDecorator variant="bottom" />}
    </ButtonBase>
  );
}

SelectableTab.propTypes = {
  /**
   * Text that will be displayed as a tab label
   */
  label: PropTypes.string.isRequired,
  /**
   * Determine whether tab is selected
   */
  selected: PropTypes.bool,
  /**
   * Fires when tab is selected
   */
  onSelect: PropTypes.func,
  /**
   * Value identifying the tab
   */
  value: PropTypes.any,
  /**
   * Size variants
   */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  className: PropTypes.string,
};

export default SelectableTab;
