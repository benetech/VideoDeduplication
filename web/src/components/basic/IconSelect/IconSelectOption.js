import React, { useCallback } from "react";
import PropTypes from "prop-types";
import SquaredIconButton from "../SquaredIconButton";
import Tooltip from "@material-ui/core/Tooltip";

function IconSelectOption(props) {
  const {
    value,
    onSelect,
    selected,
    icon: Icon,
    tooltip,
    className,
    "aria-label": ariaLabel,
    ...other
  } = props;

  const handleSelect = useCallback(() => onSelect(value), [value, onSelect]);

  const option = (
    <SquaredIconButton
      {...other}
      onClick={handleSelect}
      variant={selected ? "contained" : "outlined"}
      color={selected ? "primary" : "secondary"}
      className={className}
      role="option"
      aria-checked={selected}
      aria-label={ariaLabel || tooltip}
    >
      <Icon />
    </SquaredIconButton>
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
   * Icon that will represent option
   */
  icon: PropTypes.elementType.isRequired,
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
  "aria-label": PropTypes.string,
  className: PropTypes.string,
};

export default IconSelectOption;
