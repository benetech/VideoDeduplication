import React, { useCallback } from "react";
import SquaredIconButton from "../SquaredIconButton";
import Tooltip from "@material-ui/core/Tooltip";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import { SvgIconTypeMap } from "@material-ui/core/SvgIcon/SvgIcon";
import { ButtonProps } from "@material-ui/core/Button/Button";

function IconSelectOption<T = any>(
  props: IconSelectOptionProps<T>
): JSX.Element {
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

  const handleSelect = useCallback(() => {
    if (onSelect != null) {
      onSelect(value);
    }
  }, [value, onSelect]);

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

export type IconSelectOptionProps<T = any> = ButtonProps & {
  /**
   * Tooltip to display on hover
   */
  tooltip?: string;
  /**
   * Icon that will represent option
   */
  icon: OverridableComponent<SvgIconTypeMap>;
  /**
   * Determine whether option is selected
   */
  selected?: boolean;
  /**
   * Fires when option is selected
   */
  onSelect?: (value: T) => void;
  /**
   * Value represented by the option
   */
  value: T;
};

export default IconSelectOption;
