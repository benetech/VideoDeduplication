import React, { useCallback } from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import { ButtonProps } from "@material-ui/core/Button/Button";

function IconSelectOption<T = any>(
  props: IconSelectOptionProps<T>
): JSX.Element {
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

  const handleSelect = useCallback(() => {
    if (onSelect != null && value !== undefined) {
      onSelect(value);
    }
  }, [value, onSelect]);

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

type IconSelectOptionProps<T> = Omit<ButtonProps, "value"> & {
  /**
   * Tooltip to display on hover
   */
  tooltip?: string;
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
  value?: T;
  /**
   * Displayed option content
   */
  children: React.ReactNode;
};

export default IconSelectOption;
