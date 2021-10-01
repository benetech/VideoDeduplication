import React, { useCallback } from "react";
import clsx from "clsx";
import { ClassNameMap, makeStyles } from "@material-ui/styles";
import { ButtonBase, Theme } from "@material-ui/core";
import Badge from "@material-ui/core/Badge";

type SelectableTabStyleProps = {
  indent: number;
};

const useStyles = makeStyles<Theme, SelectableTabStyleProps>((theme) => ({
  tab: {
    cursor: "pointer",
    borderBottom: `3px solid rgba(0,0,0,0)`,
    paddingBottom: theme.spacing(0.5),
    marginLeft: ({ indent }) => theme.spacing(indent),
    flexShrink: 0,
  },
  sizeLarge: { ...theme.mixins.navlinkLarge, fontWeight: 500 },
  sizeMedium: { ...theme.mixins.navlink, fontWeight: 500 },
  sizeSmall: { ...theme.mixins.navlinkSmall, fontWeight: 500 },
  inactive: {
    color: theme.palette.action.textInactive,
  },
  selected: {
    borderBottom: `3px solid ${theme.palette.primary.main}`,
  },
  disabled: {
    cursor: "not-allowed",
  },
}));
/**
 * Get tab's label CSS class
 */

function labelClass(
  classes: ClassNameMap<"sizeMedium" | "sizeSmall" | "sizeLarge" | "inactive">,
  size: string,
  selected?: boolean
): string {
  return clsx({
    [classes.sizeMedium]: size === "medium",
    [classes.sizeSmall]: size === "small",
    [classes.sizeLarge]: size === "large",
    [classes.inactive]: !selected,
  });
}
/**
 * Get spacing between tabs.
 */

function getIndent(options: { first: boolean; spacing: number }): number {
  const { first, spacing } = options;
  if (first) {
    return 0;
  }

  return 4 * spacing;
}
/**
 * Array of selectable tabs
 */

function SelectableTab(props: SelectableTabProps): JSX.Element {
  const {
    label,
    selected,
    onSelect,
    value,
    size = "medium",
    className,
    badge,
    badgeMax,
    badgeColor = "default",
    disabled = false,
    first = true,
    spacing = 1,
    ...other
  } = props;
  const indent = getIndent({
    first,
    spacing,
  });
  const classes = useStyles({
    indent,
  });
  const handleSelect = useCallback(() => {
    if (!disabled && onSelect != null) {
      onSelect(value);
    }
  }, [disabled, onSelect, value]);
  return (
    <ButtonBase
      onClick={handleSelect}
      className={clsx(
        classes.tab,
        selected && !disabled && classes.selected,
        disabled && classes.disabled,
        className
      )}
      component="div"
      focusRipple
      disableTouchRipple
      role="tab"
      aria-label={label}
      {...other}
    >
      <Badge badgeContent={badge} max={badgeMax} color={badgeColor}>
        <div className={labelClass(classes, size, selected)}>{label}</div>
      </Badge>
    </ButtonBase>
  );
}

type SelectableTabProps = {
  /**
   * Text that will be displayed as a tab label
   */
  label: string;

  /**
   * Determine whether tab is selected
   */
  selected?: boolean;

  /**
   * Fires when tab is selected
   */
  onSelect?: (value: any) => void;

  /**
   * Value identifying the tab
   */
  value?: any;

  /**
   * Size variants
   */
  size?: "small" | "medium" | "large";

  /**
   * The value displayed with the optional badge.
   */
  badge?: React.ReactNode;

  /**
   * The color of the component. It supports those theme colors that make sense
   * for this component.
   */
  badgeColor?: "default" | "error" | "primary" | "secondary";

  /**
   * Max count to show in badge (if the value is numeric).
   */
  badgeMax?: number;

  /**
   * Indicates that tab cannot be activated.
   */
  disabled?: boolean;

  /**
   * Indicates tab is the first (always set by  enclosing SelectableTabs
   * component). Required for auto-spacing between tabs.
   */
  first?: boolean;

  /**
   * Controls auto-spacing between tabs.
   */
  spacing?: number;
  className?: string;
};
export default SelectableTab;
