import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import SelectionDecorator from "../../basic/SelectionDecorator";
import Label from "../../basic/Label";
import ButtonBase from "@material-ui/core/ButtonBase";
import useUniqueId from "../../../lib/hooks/useUniqueId";

const useStyles = makeStyles<Theme>((theme) => ({
  item: {
    "&:hover": {
      cursor: "pointer",
    },
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    transform: "translate(0%, 0px)",
    height: theme.dimensions.list.itemHeight,
    justifyContent: "flex-start",
    minWidth: 0,
  },
  icon: {
    width: 69,
    textAlign: "center",
    flexShrink: 0,
  },
  decorator: {
    height: 45,
  },
  label: {
    flexShrink: 0,
  },

  /**
   * Inactive text must be grey
   */
  inactive: {
    color: theme.palette.action.textInactive,
  },

  /**
   * Title is visible and will fade smoothly when item is collapsed.
   */
  visible: {
    opacity: 1,
    transition: theme.transitions.create("opacity", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },

  /**
   * Title is invisible and will emerge smoothly when item is expanded.
   */
  invisible: {
    opacity: 0,
    transition: theme.transitions.create("opacity", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  collapsed: {
    width: theme.dimensions.list.collapseWidth,
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  expanded: {
    width: theme.mixins.drawer.width,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));
/**
 * Application left-side menu item.
 */

function AppMenuListItem(props: AppMenuListItemProps): JSX.Element {
  const {
    icon,
    title,
    selected = false,
    onClick,
    collapsed = false,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const labelId = useUniqueId("link-label");
  let decorator: JSX.Element | null = null;

  if (selected) {
    decorator = (
      <SelectionDecorator variant="left" className={classes.decorator} />
    );
  }

  return (
    <ButtonBase
      className={clsx(
        classes.item,
        collapsed && classes.collapsed,
        !collapsed && classes.expanded,
        className
      )}
      onClick={onClick}
      focusRipple
      disableTouchRipple
      role="link"
      component="div"
      aria-labelledby={labelId}
      data-selector="AppMenuItem"
      {...other}
    >
      {decorator}
      <div
        className={clsx(classes.icon, {
          [classes.inactive]: !selected,
        })}
      >
        {icon}
      </div>
      <Label
        id={labelId}
        variant="title3"
        color="inherit"
        className={clsx(classes.label, {
          [classes.visible]: !collapsed,
          [classes.invisible]: collapsed,
          [classes.inactive]: !selected,
        })}
        bold={selected}
      >
        {title}
      </Label>
    </ButtonBase>
  );
}

type AppMenuListItemProps = {
  icon: React.ReactNode;
  title: string;
  selected?: boolean;
  onClick?: (...args: any[]) => void;
  collapsed?: boolean;
  className?: string;
};
export default AppMenuListItem;
