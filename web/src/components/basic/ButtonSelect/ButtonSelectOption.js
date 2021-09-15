import React, { useCallback } from "react";
import PropTypes from "prop-types";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";

function IconSelectOption(props) {
  const {
    children,
    value,
    onSelect,
    selected,
    tooltip,
    className,
    "aria-label": ariaLabel,
    ...other
  } = props;

  const handleSelect = useCallback(() => onSelect(value), [value, onSelect]);

  const option = (
    <Button
      {...other}
      onClick={handleSelect}
      variant={selected ? "contained" : "outlined"}
      color={selected ? "primary" : "secondary"}
      className={className}
      role="option"
      aria-checked={selected}
      aria-label={ariaLabel || tooltip}
    >
      {children}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} enterDelay={1000}>
        {option}
      </Tooltip>
    );
  }

  return option;
}

IconSelectOption.propTypes = {
  /**
   * Tooltip to display on hover
   */
  tooltip: PropTypes.string,
  /**
   * Determine whether option is selected
   */
  selected: PropTypes.bool,
  /**
   * Fires when option is selected
   */
  onSelect: PropTypes.func,
  /**
   * Value represented by the option
   */
  value: PropTypes.any,
  /**
   * Displayed option content
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  "aria-label": PropTypes.string,
  className: PropTypes.string,
};

export default IconSelectOption;
