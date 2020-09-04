import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import SelectionDecorator from "../../../common/components/SelectionDecorator";
import Label from "../../../common/components/Label";
import ButtonBase from "@material-ui/core/ButtonBase";

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
    justifyContent: "flex-start",
  },
  icon: {
    width: 69,
    textAlign: "center",
  },
  decorator: {
    height: 45,
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
    <ButtonBase
      className={clsx(classes.item, className)}
      onClick={onClick}
      focusRipple
      disableTouchRipple
    >
      {decorator}
      <div className={clsx(classes.icon, { [classes.inactive]: !selected })}>
        {icon}
      </div>
      <Label
        variant="title3"
        color="inherit"
        className={clsx({
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

AppMenuListItem.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  collapsed: PropTypes.bool,
  className: PropTypes.string,
};

export default AppMenuListItem;
