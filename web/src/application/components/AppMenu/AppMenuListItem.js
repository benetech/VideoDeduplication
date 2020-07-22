import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import SelectionDecorator from "../SelectionDecorator";
import Label from "../Label";

const useStyles = makeStyles((theme) => ({
  item: {
    "&:hover": {
      cursor: "pointer",
    },
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    transform: "translate(0%, 0px)",
    height: theme.dimensions.list.itemHeight,
  },
  icon: {
    width: 69,
    textAlign: "center",
  },
  decorator: {
    height: 45,
  },
  /**
   * Inactive text must be gray
   */
  inactive: {
    color: theme.palette.action.textInactive,
    fontWeight: "normal",
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
}));

/**
 * Application left-side menu item.
 */
function AppMenuListItem(props) {
  const {
    icon,
    title,
    selected = false,
    onClick,
    collapsed = false,
    className,
  } = props;
  const classes = useStyles();

  let decorator = null;
  if (selected) {
    decorator = (
      <SelectionDecorator variant="left" className={classes.decorator} />
    );
  }

  return (
    <div className={clsx(classes.item, className)} onClick={onClick}>
      {decorator}
      <div className={clsx(classes.icon, { [classes.inactive]: !selected })}>
        {icon}
      </div>
      <Label
        role="title3"
        color="inherit"
        className={clsx({
          [classes.visible]: !collapsed,
          [classes.invisible]: collapsed,
          [classes.inactive]: !selected,
        })}
      >
        {title}
      </Label>
    </div>
  );
}

AppMenuListItem.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  collapsed: PropTypes.bool,
  className: PropTypes.string,
};

export default AppMenuListItem;
